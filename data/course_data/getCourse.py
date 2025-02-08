"""
Author: Raymond Xu
Start Date: February 8, 2025
"""

import json 
import sys
import os 
from parseText import *
sys.path.append(os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../..")))
from constants import *
from apiGet import *

def get_subjects(semester):
    """
    return a dictionary of subjects in a given semester
    `semester` is the code of a semester in a str format
    """
    data = api_get_subjects(semester)
    subject_data = data["data"]["subjects"]
    
    result = {}
    for subject in subject_data:
        result[subject["value"]] = subject["descr"]

    return result 

def get_course_details(semester,subject,max_level=5):
    """
    return a dictionary that contains details of courses 
    provided by a subject in a given semester
    `semester` and `subject` are str, `max_level` is an int
    """
    data = get(semester,subject=subject)
    course_data = data["data"]["classes"]

    result = {}
    for course in course_data:
        if int(course["catalogNbr"][0]) > max_level:
            break
        code = course["subject"] + course["catalogNbr"]
        details = {}

        details["Title (long)"] = course["titleLong"]
        details["Title (short)"] = course["titleShort"]
        details["Description"] = clean(course["description"])
        details["Forbidden Overlaps"] = parse_overlap(
            course["catalogForbiddenOverlaps"])
        details["Distributions"] = parse_distr(course["catalogDistr"])
        details["Enrollment Permission"] = clean(course["catalogPermission"])
        details["Comments"] = clean(course["catalogComments"])
        details["Outcomes"] = clean_list(course["catalogOutcomes"])
        
        preco_dict = parse_preco(course["catalogPrereqCoreq"])
        details["Prerequisites"] = preco_dict["Prerequisites"] if preco_dict else None
        details["Corequisites"] = preco_dict["Corequisites"] if preco_dict else None
        details["Prerequisites or Corequisites"] = preco_dict["Prerequisites or Corequisites"] if preco_dict else None
        details["Need_note"] = preco_dict["Need Note"] if preco_dict else None
 
        result[code] = details
        print(f"finished {subject}")
    return result

def get_all_courses(semester,max_level=5):
    subjects = get_subjects(semester)
    result = {}
    for subject in subjects:
        value = get_course_details(semester,subject,max_level)
        result[subject] = value
    return result

def to_json(dict):
    file_path = os.path.join("new_combined", 'combined.json')
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(dict, f, indent=4)

to_json(get_all_courses(LAST_SEMESTER))
