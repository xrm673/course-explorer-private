"""
Author: Raymond Xu
Start Date: January 3, 2025
"""

from flask import Flask, session, request, jsonify, redirect, url_for, render_template
import json
import re
import special
import parseMajor
from course import *
from constants import *
import os

app = Flask(__name__)
app.secret_key = 'some_random_secret_key'

course_data_am = {}
course_data_nz = {}
SP_session = {}
FA_session = {}
SU_session = {}
WI_session = {}
college_data = {}
major1_data = {}
major2_data = {}

CURRENT = 2025
LATEST = 2030

@app.before_request
def load_data():
    load_course_data()
    load_college_data()
    load_instructor_data()

# helper for load data
def load_course_data():
    global course_data_am
    global course_data_nz
    global SP_session
    global FA_session
    global WI_session
    global SU_session
    
    filepath = os.path.join(COURSE_DATA_ROUTE,"combined_am.json")
    with open(filepath, 'r') as file:
        course_data_am = json.load(file)
    
    filepath = os.path.join(COURSE_DATA_ROUTE,"combined_nz.json")
    with open(filepath,'r') as file:
        course_data_nz = json.load(file)
    
    filepath = os.path.join(SESSION_DATA_ROUTE,"SP_session.json")
    with open(filepath,'r') as file:
        SP_session = json.load(file)
    
    filepath = os.path.join(SESSION_DATA_ROUTE,"FA_session.json")
    with open(filepath,'r') as file:
        FA_session = json.load(file)
    
    filepath = os.path.join(SESSION_DATA_ROUTE,"SU_session.json")
    with open(filepath,'r') as file:
        SU_session = json.load(file)
    
    filepath = os.path.join(SESSION_DATA_ROUTE,"WI_session.json")
    with open(filepath,'r') as file:
        WI_session = json.load(file)

# helper for load data
def load_college_data():
    global college_data
    with open('data/college_data/college.json', 'r') as file:
        college_data = json.load(file)

def load_instructor_data():
    global instructor_data
    with open('data/instructor_data/instructor_rate.json', 'r') as file:
        instructor_data = json.load(file)

@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template(
        'index.html',
        college = session['college'] if 'college' in session else None,
        major_codes = session['majors'] if 'majors' in session else None,
        minor_codes = session['minors'] if 'minors' in session else None,
        subjects = session['subjects'] if 'subjects' in session else None,
        year = session['year'] if 'year' in session else None,
        majors = MAJORS,
        minors = MINORS,
        colleges = COLLEGES,
        graduations = GRADUATION_YEARS)

@app.route('/save-information', methods=['POST'])
def save_data():
    data = request.get_json()
    
    session['college'] = data['college']
    session['majors'] = data['majors']
    session['minors'] = data['minors']
    session['subjects'] = data['subjects']
    session['graduationYear'] = data['graduationYear']

    return jsonify({"message": "Data saved successfully!"})

# @app.route('/select-college', methods=['GET', 'POST'])
# def select_college():
#     if request.method == 'POST':
#         college = request.form.get("college")
#         if not college or college not in college_data:
#             return "You must select a college.", 400
#         session['college'] = college
#         return redirect(url_for('select_major'))
#     return render_template('select-college.html',colleges=college_data)

# @app.route('/select-major', methods=['GET', 'POST'])
# def select_major():
#     if 'college' not in session:
#         return redirect(url_for('select-college'))
#     college = session['college']
#     majors = college_data[college]['Majors']
#     minors = college_data["Minors"]
#     if request.method == 'POST':
#         major1 = request.form.get("major1")
#         major2 = request.form.get("major2")
#         minor1 = request.form.get("minor1")
#         if not major1 or major1 not in majors:
#             return "You must select at least one major.", 400
#         if major2 and (major2 not in majors or major1 == major2):
#             return "Your second major must be different and valid.", 400
#         session['major1'] = major1
#         session['major2'] = major2 if major2 else None
#         session['minor1'] = minor1 if minor1 else None
#         return redirect(url_for('select_year'))
#     return render_template('select-major.html',majors=majors,minors=minors)

# @app.route('/select-year',methods=['GET', 'POST'])
# def select_year():
#     options = list(range(LATEST, CURRENT-1, -1))
#     if request.method == 'POST':
#         year = request.form.get("year")
#         if not year or int(year) not in options:
#             return "You must select a valid year.", 400
#         session['year'] = year
#         return redirect(url_for('select_courses'))
#     return render_template('select-year.html',year_options = options)

@app.route('/select-courses', methods=['GET', 'POST'])
def select_courses():
    if request.method == 'POST':
        courses_taken = request.form.getlist('courses')
        if not courses_taken:
            courses_taken = []
        session['courses_taken'] = courses_taken
        return redirect(url_for('index'))
    return render_template('select-courses.html')

@app.route('/search-courses', methods=['GET'])
def search_courses():
    query = request.args.get('query', '').upper()
    if not query:
        return jsonify([])
    matching_courses = []
    if query.isalpha():
        for subject in course_data:
            if query in subject:
                count = 0
                for course_code, course_info in course_data[subject].items():
                    matching_courses.append({
                        'course_code': course_code,
                        'title': course_info['Title']
                    })
                    count += 1
                    if count == 8:
                        return jsonify(matching_courses)
        return jsonify(matching_courses)
    else:
        query_subject = course.get_subject(query)
        if query_subject in course_data:
            for course_code, course_info in course_data[query_subject].items():
                if query in course_code:
                    matching_courses.append({
                        'course_code': course_code,
                        'title': course_info['Title']
                    })
            return jsonify(matching_courses[:8])
    return jsonify([])

@app.route('/<course_code>',methods = ['GET'])
def display_course(course_code):
    if course_code[0] in A_TO_M:
        course_created = Course.create(course_code,course_data_am,
                                       SP_session,FA_session,
                                       SU_session,WI_session)
    else:
        course_created = Course.create(course_code,course_data_nz,
                                       SP_session,FA_session,
                                       SU_session,WI_session)
    title = course_created.get_title()
    subject = course_created.get_subject()
    number = course_created.get_number()
    description = course_created.get_description()
    credits = course_created.get_credits()
    semesters = course_created.get_semester_offered()
    crt_instr_dict = course_created.get_instructors(semesters[0])
    crt_quality = course_created.get_quality(crt_instr_dict,instructor_data)
    recent_semester = semesters[0]
    distributions = course_created.get_distribution()
    prereq = course_created.get_prereq()
    requirement = course_created.get_requirement()
    outcomes = course_created.get_outcomes()
    comments = course_created.get_comments()
    # recommend = data["Recommended Prerequisite"]
    permission = course_created.get_permission()
    return render_template(
        'course.html',
        course_code = course_code,
        title = title,
        subject = subject,
        number = number,
        quality = crt_quality,
        recent_semester = recent_semester,
        description = description,
        credits = credits,
        semesters = semesters,
        instructors = crt_instr_dict,
        distributions = distributions,
        prereq = prereq,
        requirement = requirement,
        outcomes = outcomes,
        comments = comments,
        permission = permission
        )

@app.route('/<major_displayed>-<college>', methods=['GET'])
def display_major(major_displayed, college):
    courses_taken = session['courses_taken']
    major1 = session["major1"]
    major2 = session["major2"]
    major_d_data = load_major_data(major_displayed)
    minor1 = session["minor1"]
    # minor2 = session["minor2"]
    # minor3 = session["minor3"]
    session['number_int'] = 0
    session['number_list'] = [0]
    if major2:
        if major1 == major_displayed:
            major_left = major2
        if major2 == major_displayed:
            major_left = major1
        major_l_data = load_major_data(major_left)
    else:
        major_left = None
        major_l_data = None
    minor1_data = load_minor_data(minor1) if minor1 else None
    sections = parseMajor.parse_major(course_data,courses_taken,college,
    major_displayed,major_d_data,major_left,major_l_data,minor1,minor1_data)

    simple_sections = {}
    searchable_sections = {}

    for section_name, info in sections.items():
        if isinstance(info['Courses'], list):
            simple_sections[section_name] = info
        else:
            searchable_sections[section_name] = info

    return render_template(
        'display-major.html',
        course_data = course_data,
        courses_taken = session['courses_taken'],
        major=major_displayed,
        college=college,
        simple_sections=simple_sections,
        searchable_sections=searchable_sections,
        number = session['number_int'],
        number_list = session['number_list']
    )

@app.route('/add_course_taken', methods=['POST'])
def add_course_taken():
    data = request.json
    course_code = data.get('course')

    if not course_code:
        return jsonify({'error': 'No course provided'}), 400

    # Initialize session["courses_taken"] if it doesn't exist
    if 'courses_taken' not in session:
        session['courses_taken'] = []
    if not session['courses_taken']:
        session['courses_taken'] = []
    # if course_code not in session['courses_taken']:
    #     session['courses_taken'].append(course_code)
    #     print(session['courses_taken'])
    # return jsonify(session['courses_taken'])

    courses_taken = session['courses_taken'][:]
    if course_code not in courses_taken:
        courses_taken.append(course_code)
        session['courses_taken'] = courses_taken
        print(session['courses_taken'])
    return jsonify(session['courses_taken'])

@app.route('/remove_course_taken', methods=['POST'])
def remove_course_taken():
    data = request.json
    course_code = data.get('course')

    if not course_code:
        return jsonify({'error': 'No course provided'}), 400

    # Check if 'courses_taken' exists in the session
    if 'courses_taken' not in session:
        session['courses_taken'] = []

    courses_taken = session['courses_taken'][:]
    # Remove the course from session['courses_taken'] if it exists
    if course_code in session['courses_taken']:
        courses_taken.remove(course_code)
        session['courses_taken'] = courses_taken

    # Return the updated list of courses
    return jsonify(session['courses_taken'])

@app.route('/check_eligibility', methods=['POST'])
def check_eligibility():
    data = request.json
    course_code = data.get('course')

    if not course_code:
        return jsonify({'error': 'No course provided'}), 400

    courses_taken = session.get('courses_taken', [])
    is_eligible, _ = course.check_eligibility(course_data, courses_taken, course_code)

    return jsonify({'course': course_code, 'is_eligible': is_eligible})

@app.template_filter('extract_subject')
def extract_subject(course_code):
    return course.get_subject(course_code)

@app.template_filter('extract_number')
def extract_number(course_code):
    return course.get_number(course_code)

@app.template_filter('get_recent_semester')
def get_recent_semester(course_code):
    semester_list = course.get_semester_offered(course_data,course_code)
    return semester_list[0]

@app.template_filter('is_eligible')
def is_eligible(course_code):
    courses_taken = session['courses_taken']
    check,list = course.check_eligibility(course_data,courses_taken,course_code)
    return check

def is_group_taken(group, courses_taken):
    return any(course in courses_taken for course in group)

app.jinja_env.globals.update(is_group_taken=is_group_taken)

# @app.route('/api/search-section-courses', methods=['POST'])
# def search_section_courses():
#     data = request.json
#     print(f"Incoming data: {data}")
#     query = data.get('query', '').upper()
#     remaining_courses = data.get('remaining_courses', [])
#     print(f"Query: {query}, Remaining Courses: {remaining_courses}")
#
#     if not query or not remaining_courses:
#         return jsonify([])
#
#     # Filter remaining courses based on the query
#     matching_courses = [
#         course for course in remaining_courses if query in course.upper()
#     ]
#     print(f"Matching Courses: {matching_courses}")
#
#     # Limit the results to 8 courses
#     return jsonify(matching_courses[:8])

def load_major_data(major):
    with open(f"data/major_data/{major}.json", 'r') as file:
        major_data = json.load(file)
    return major_data

def load_minor_data(minor):
    with open(f"data/minor_data/{minor}.json", 'r') as file:
        minor_data = json.load(file)
    return minor_data


#-----------------------------------------------------------------------------
#helper functions
def load_major1(major1):
    global major1_data
    with open(f"data/major_data/{major1}.json", 'r') as file:
        major1_data = json.load(file)

def load_major2(major2):
    global major2_data
    with open(f"data/major_data/{major2}.json", 'r') as file:
        major2_data = json.load(file)

#------------------------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True)
