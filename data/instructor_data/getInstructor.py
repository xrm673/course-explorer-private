"""
Author: Raymond Xu
Start Date: February 13, 2025
"""

import json 
import sys
import os 
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

def get_instructors(semester,subject,max_level=5):
    """
    return a dictionary that contains the instructors of all course sessions 
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
        count = 0
        details = {}
        for group in course["enrollGroups"]:
            count += 1
            grp_key = f"Grp{str(count)}"
            sct = {}
            for section in group["classSections"]:
                type = section["ssrComponent"]
                nbr = section["section"]
                sct_key = f"{type}-{nbr}"
                instr_details = []
                for meeting in section["meetings"]:
                    for instructor in meeting["instructors"]:
                        instr_details.append(instructor)
                sct[sct_key] = instr_details 
            details[grp_key] = sct 
        result[code] = details 
    print(f"finished {subject}")
    return result

def get_all_instructors(semester,max_level=5):
    """
    return a dictionary with all the courses 
    provided by Cornell in a given semester.
    """
    subjects = get_subjects(semester)
    result = {}
    for subject in subjects:
        value = get_instructors(semester,subject,max_level)
        if value == {}:
            continue
        result[f"{subject}-{semester}"] = value
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

def get_one_year(semester,max_level=5):
    result = {}
    count = 0
    while count < 4:
        instructor_data = get_all_instructors(semester,max_level)
        for subject in instructor_data:
            result[subject] = instructor_data[subject]
        semester = prev_semester(semester)
        count += 1

    with open("instructor_name_data.json", "w", encoding="utf-8") as f:
        json.dump(result, f, indent=4)

get_one_year(LAST_SEMESTER) 
