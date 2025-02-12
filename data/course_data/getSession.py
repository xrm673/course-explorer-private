"""
Author: Raymond Xu
Start Date: February 9, 2025
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

def get_session_details(semester,subject,max_level=5):
    """
    return a dictionary that contains the details of all course sessions 
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
            group_dict = {}
            group_dict["crd"] = parse_credit(group["unitsMaximum"],group["unitsMinimum"])
            group_dict["req"] = group["componentsRequired"]
            if group["componentsOptional"] != []:
                group_dict["opt"] = group["componentsOptional"]
            group_dict["gradingb"] = group["gradingBasis"]
            group_dict["session_code"] = group["sessionCode"]
            if group["simpleCombinations"] != []:
                group_dict["cmb"] = group["simpleCombinations"]

            for section in group["classSections"]:
                # DIS-201, PRJ-602, etc.
                section_dict = {}
                type = section["ssrComponent"]
                nbr = section["section"]
                sct_key = f"{type}-{nbr}"
                section_dict["id"] = section["classNbr"]
                if section["openStatus"] != "O":
                    section_dict["open"] = section["openStatus"]
                if section["topicDescription"] != "":
                    section_dict["tpc"] = section["topicDescription"]
                if section["location"] != "ITH":
                    section_dict["loctn"] = section["location"]
                if section["addConsent"] != "N":
                    section_dict["consent"] = section["addConsent"]
                if section["instructionMode"] != "P":
                    section_dict["mode"] = section["instructionMode"]

                for meeting in section["meetings"]:
                    meeting_dict = {}
                    meeting_key = f"meeting{str(meeting["classMtgNbr"])}"
                    meeting_dict["tmstart"] = meeting["timeStart"]
                    meeting_dict["tmend"] = meeting["timeEnd"]
                    meeting_dict["ptn"] = meeting["pattern"]
                    if (group["sessionCode"] != "1" or 
                        meeting["startDt"] != TERM_START or meeting["endDt"] != TERM_END):
                        meeting_dict["start_dt"] = meeting["startDt"]
                        meeting_dict["end_dt"] = meeting["endDt"]
                    if (meeting["instructors"] and 
                        meeting["instructors"] != [] and type != "DIS"):
                        meeting_dict["instr"] = {semester:parse_instructor(meeting["instructors"])}
                    if (meeting["meetingTopicDescription"] and 
                        meeting["meetingTopicDescription"] != ""):
                        meeting_dict["mt_tpc"] = meeting["meetingTopicDescription"]
                    section_dict[meeting_key] = meeting_dict
                
                section_notes = []
                for note in section["notes"]:
                    note_text = note["descrlong"]
                    section_notes.append(note_text)
                    if has_preco(note_text):
                        preco_dict = parse_preco(note_text)
                        if preco_dict["Prerequisites"]:
                            section_dict["prereq"] = preco_dict["Prerequisites"]
                        if preco_dict["Corequisites"]:
                            section_dict["coreq"] = preco_dict["Corequisites"]
                        if preco_dict["Prerequisites or Corequisites"]:
                            section_dict["preco"] = preco_dict["Prerequisites or Corequisites"]
                        section_dict["nd_note"] = preco_dict["Need Note"]
                if section_notes != []:
                    section_dict["notes"] = section_notes
                group_dict[sct_key] = section_dict
            details[f"Grp{str(count)}"] = group_dict 
        result[code] = details
    print(f"finished {subject}")
    return result

def get_all_sessions(semester,max_level=5):
    """
    return a dictionary with all the courses 
    provided by Cornell in a given semester.
    """
    subjects = get_subjects(semester)
    result = {}
    for subject in subjects:
        value = get_session_details(semester,subject,max_level)
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

def get_one_year(semester,max_level=5):
    session_data = get_all_sessions(semester,max_level)
    count = 0
    while count < 3:
        count += 1
        semester = prev_semester(semester)
        subjects = get_subjects(semester)
        for subject in subjects:
            value = get_session_details(semester,subject,max_level)
            if not value:
                continue 
            if not subject in session_data:
                session_data[subject] = value 
            else:
                for course_code in value:
                    if course_code in session_data[subject]:
                        course_session_data = session_data[subject][course_code]
                        course_value_data = value[course_code]
                        instr_added = find_instructors(course_value_data,semester)
                        session_data[subject][course_code] = add_instructors(course_session_data,instr_added,semester)
                    else:
                        session_data[subject][course_code] = value[course_code]
    return session_data

def find_instructors(course_value_data,semester):
    """
    Extracts instructor information from previous semester's course data.
    Returns a nested dictionary structured as:
    {group: {session: {meeting: instructors}}}
    """
    instructor_data = {}
    has_ins = False
    
    for group in course_value_data:
        if group not in instructor_data:
            instructor_data[group] = {}

        for session in course_value_data[group]:
            if len(session) == 7:  # Session ID check
                if session not in instructor_data[group]:
                    instructor_data[group][session] = {}

                for meeting in course_value_data[group][session]:
                    if len(meeting) == 8:  # Meeting ID check
                        if "instr" in course_value_data[group][session][meeting]:
                            instructors = course_value_data[group][session][meeting]["instr"]
                            instructor_data[group][session][meeting] = instructors
                            has_ins = True
    if has_ins:
        return instructor_data
    else:
        return {} 

def add_instructors(course_session_data,instructor_data,semester):
    """
    Transfers instructors from previous semester to current semester
    by matching group, session, and meeting structure.
    """
    if instructor_data == {}:
        return course_session_data
    for group in course_session_data:
        if group not in instructor_data:
            continue  # No previous data for this group, skip

        for session in course_session_data[group]:
            if session not in instructor_data[group]:
                continue  # No matching session in previous semester

            for meeting in course_session_data[group][session]:
                if meeting not in instructor_data[group][session]:
                    continue  # No matching meeting, skip

                # Get the previous instructor list
                prev_instr = instructor_data[group][session][meeting]

                # Ensure "instr" exists in current data
                if "instr" not in course_session_data[group][session][meeting]:
                    course_session_data[group][session][meeting]["instr"] = {}

                # Merge the instructor dictionaries, keeping unique instructor IDs
                course_session_data[group][session][meeting]["instr"][semester] = prev_instr[semester]

    return course_session_data

def break_data(data):
    session_am = {}
    session_nz = {}
    for subject in data:
        if subject[0] in A_TO_M:
            session_am[subject] = data[subject]
        else:
            session_nz[subject] = data[subject]
    file_path = os.path.join("session", 'session_am.json')
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(session_am, f, indent=4)
    file_path = os.path.join("session", 'session_nz.json')
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(session_nz, f, indent=4)

def get_all_types(data):
    result = []
    for subject in data:
        for course_code in data[subject]:
            for group in data[subject][course_code]:
                req = data[subject][course_code][group]["req"]
                if isinstance(req,list):
                    result.append(tuple(req))
                result.append(req)
    return list(set(result))

data = get_one_year(LAST_SEMESTER)
print(get_all_types(data))
break_data(data)
# with open("sessions_combined.json", "w", encoding="utf-8") as f:
#     json.dump(data, f, indent=4)
            
