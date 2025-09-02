from flask import Blueprint, request, jsonify
from sqlalchemy import or_, desc, asc
from sqlalchemy.exc import IntegrityError
from ..db import db
from ..models.job import Job
from marshmallow import Schema, fields, validates, ValidationError, post_load
import uuid
from datetime import datetime

job_bp = Blueprint('jobs', __name__)

# Marshmallow Schema for Job Validation (Input/Output)
class JobSchema(Schema):
    
    id = fields.Integer(dump_only=True)
    title = fields.String(required=True, validate=lambda x: len(x.strip()) > 0,
                          error_messages={"required": "Title is required", "invalid": "Title cannot be empty"})
    company = fields.String(required=True, validate=lambda x: len(x.strip()) > 0,
                            error_messages={"required": "Company is required", "invalid": "Company cannot be empty"})
    city = fields.String(required=True, validate=lambda x: len(x.strip()) > 0,
                         error_messages={"required": "City is required", "invalid": "City cannot be empty"})
    country = fields.String(allow_none=True)
    posting_date = fields.Date(allow_none=True,format='%Y-%m-%d')  
    job_type = fields.String(allow_none=True)
    tags = fields.Raw(allow_none=True)  
    job_id = fields.String(dump_only=True)

    @validates('job_type')
    def validate_job_type(self, value):
        if value and value not in ['Full-Time', 'Part-Time', 'Contract', 'Internship']:
            raise ValidationError('Invalid job_type. Must be one of: Full-Time, Part-Time, Contract, Internship')

    @post_load
    def process_tags(self, data, **kwargs):
        if 'tags' in data and isinstance(data['tags'], list):
            data['tags'] = ','.join(str(tag) for tag in data['tags'])
        return data

    @post_load
    def process_posting_date(self, data, **kwargs):
        # Convert string date to date object if needed
        if 'posting_date' in data and isinstance(data['posting_date'], str):
            try:
                data['posting_date'] = datetime.strptime(data['posting_date'], '%Y-%m-%d').date()
            except ValueError:
                # Handle invalid date format
                raise ValidationError('Invalid date format. Use YYYY-MM-DD.')
        return data


# Instantiate schema for single and multiple jobs
job_schema = JobSchema()
jobs_schema = JobSchema(many=True)


@job_bp.route('/jobs', methods=['GET'])
def get_jobs():
    try:
        job_type = request.args.get('job_type')
        location = request.args.get('location')
        tag = request.args.get('tag')
        sort = request.args.get('sort', 'posting_date_desc')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))

        query = Job.query

        if job_type:
            query = query.filter(Job.job_type == job_type)

        if location:
            query = query.filter(or_(Job.city.ilike(f'%{location}%'), Job.country.ilike(f'%{location}%')))

        if tag:
            query = query.filter(Job.tags.ilike(f'%{tag}%'))

        # Sort by date field (now properly works with DATE type)
        if sort == 'posting_date_desc':
            query = query.order_by(desc(Job.posting_date))
        elif sort == 'posting_date_asc':
            query = query.order_by(asc(Job.posting_date))
        else:
            return jsonify({'error': 'Invalid sort parameter. Supported: posting_date_desc, posting_date_asc'}), 400

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            "jobs": jobs_schema.dump(pagination.items),
            "meta": {
                "page": pagination.page,
                "per_page": pagination.per_page,
                "total_jobs": pagination.total,
                "total_pages": pagination.pages
            }
        }), 200
    except Exception as e:
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500


@job_bp.route('/jobs/<int:id>', methods=['GET'])
def get_job(id):
    try:
        job = Job.query.get(id)
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        return jsonify(job_schema.dump(job)), 200
    except Exception as e:
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500


@job_bp.route('/jobs', methods=['POST'])
def create_job():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400

        # Validate and deserialize input
        result = job_schema.load(data)

        
        result['job_id'] = str(uuid.uuid4())

        job = Job(**result)
        db.session.add(job)
        db.session.commit()
        return jsonify(job_schema.dump(job)), 201
    except ValidationError as ve:
        return jsonify({'error': ve.messages}), 400
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Duplicate job_id or other integrity violation'}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500


@job_bp.route('/jobs/<int:id>', methods=['PUT', 'PATCH'])
def update_job(id):
    try:
        job = Job.query.get(id)
        if not job:
            return jsonify({'error': 'Job not found'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400

        # Validate and deserialize input (partial=True for PATCH)
        result = job_schema.load(data, partial=(request.method == 'PATCH'))

        for key, value in result.items():
            setattr(job, key, value)

        db.session.commit()
        return jsonify(job_schema.dump(job)), 200
    except ValidationError as ve:
        return jsonify({'error': ve.messages}), 400
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Duplicate job_id or other integrity violation'}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500


@job_bp.route('/jobs/<int:id>', methods=['DELETE'])
def delete_job(id):
    try:
        job = Job.query.get(id)
        if not job:
            return jsonify({'error': 'Job not found'}), 404

        db.session.delete(job)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500