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
    content = api_get_subjects(semester)
    data = content["data"]["subjects"]
    
    result = {}
    for subject in data:
        result[subject["value"]] = subject["descr"]

    return result 

def get_course_details(semester,subject,max_level=5):
    """
    return a dictionary that contains the details of all courses 
    provided by a subject in a given semester.

    `semester` and `subject` are str, `max_level` is an int
    """
    content = get(semester,subject)
    if not content:
        return {}
    data = content["data"]["classes"]

    result = {}
    for course in data:
        if int(course["catalogNbr"][0]) > max_level:
            break
        code = course["subject"] + course["catalogNbr"]
        details = {}

        details["ttl"] = course["titleLong"]
        details["tts"] = course["titleShort"]
        details["smst"] = [semester]
        details["dsrpn"] = clean(course["description"])
        details["req"] = clean(course["catalogPrereqCoreq"])
        if parse_distr(course["catalogDistr"]):
            details["distr"] = parse_distr(course["catalogDistr"])
        if parse_overlap(course["catalogForbiddenOverlaps"]):
            details["ovlp"] = parse_overlap(
                course["catalogForbiddenOverlaps"])
        if clean(course["catalogPermission"]):
            details["pmsn"] = clean(course["catalogPermission"])
        if clean(course["catalogComments"]):
            details["cmts"] = clean(course["catalogComments"])
        if clean_list(course["catalogOutcomes"]):
            details["otcm"] = clean_list(course["catalogOutcomes"])
        
        preco_dict = parse_preco(course["catalogPrereqCoreq"])
        if preco_dict["Prerequisites"]:
            details["prereq"] = preco_dict["Prerequisites"]
        if preco_dict["Corequisites"]:
            details["coreq"] = preco_dict["Corequisites"]
        if preco_dict["Prerequisites or Corequisites"]:
            details["preco"] = preco_dict["Prerequisites or Corequisites"]
        details["note"] = preco_dict["Need Note"]
 
        result[code] = details
    print(f"finished {subject}-{semester}")
    return result

def get_all_courses(semester,max_level=5):
    """
    return a dictionary with all the courses 
    provided by Cornell in a given semester.
    """
    subjects = get_subjects(semester)
    result = {}
    for subject in subjects:
        value = get_course_details(semester,subject,max_level)
        if value == {}:
            continue
        result[subject] = value
    return result

def prev_semester(semester):
    """
    return the previous semester
    """
    season = semester[:2]
    year = int(semester[2:])
    if season == "SP":
        season = "WI"
    elif season == "WI":
        season = "FA"
        year -= 1
    elif season == "FA":
        season = "SU"
    elif season == "SU":
        season = "SP"
    semester = season + str(year)
    return semester

# def to_json(filename,data):
#     with open(f"{filename}.json", "w", encoding="utf-8") as f:
#         json.dump(data, f, indent=4)


# def get_three_years(semester,max_level=5):
#     data = get_all_courses(semester,max_level)
#     to_json(f"LAST_{semester}",data)
#     count = 0
#     while count < 6:
#         count += 1
#         semester = prev_semester(semester)
#         data = get_all_courses(semester,max_level)
#         to_json(semester,data)

# def combine_all():
#     current_directory = os.getcwd()

#     for filename in os.listdir(current_directory):
#         if filename.endswith(".json") and "LAST" in filename:
#             with open(filename, "r", encoding="utf-8") as f:
#                 current_data = json.load(f)
#             break

#     if current_data is None:
#         raise FileNotFoundError(f"{LAST_SEMESTER} file not found in the directory!")

#     for filename in os.listdir(current_directory):
#         if filename.endswith(".json") and not "LAST" in filename:
#             semester = filename[:4]
#             with open(filename, "r", encoding="utf-8") as f:
#                 data = json.load(f)
#             for subject in data:
#                 if not subject in current_data:
#                     current_data[subject] = data[subject]
#                 else:
#                     for course_code in data[subject]:
#                         if course_code in current_data[subject]:
#                             current_data[subject][course_code]["Semester Offered"].append(semester)
#                         else:
#                             current_data[subject][course_code] = data[subject][course_code]
    
#     file_path = os.path.join("new_combined", 'combined.json')
#     with open(file_path, "w", encoding="utf-8") as f:
#         json.dump(current_data, f, indent=4)

            

def get_three_years(semester,max_level=5):
    course_data = get_all_courses(semester,max_level)
    count = 0
    while count < 12:
        count += 1
        semester = prev_semester(semester)
        subjects = get_subjects(semester)
        for subject in subjects:
            value = get_course_details(semester,subject,max_level)
            if value == {}:
                continue
            if not subject in course_data:
                course_data[subject] = value
            else:
                for course_code in value:
                    if course_code in course_data[subject]:
                        course_data[subject][course_code]["smst"].append(semester)
                    else:
                        course_data[subject][course_code] = value[course_code]
        
    return course_data

def break_data(data):
    combined_am = {}
    combined_nz = {}
    for subject in data:
        if subject[0] in A_TO_M:
            combined_am[subject] = data[subject]
        else:
            combined_nz[subject] = data[subject]
    file_path = os.path.join("combined", 'combined_am.json')
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(combined_am, f, indent=4)
    file_path = os.path.join("combined", 'combined_nz.json')
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(combined_nz, f, indent=4)



def to_json(data):
    file_path = os.path.join("combined", 'new_combined.json')
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

data = get_three_years(LAST_SEMESTER)
break_data(data)
# combine_all()
