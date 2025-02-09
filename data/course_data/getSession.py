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
            group_dict["grading"] = group["gradingBasis"]
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
                        meeting_dict["instr"] = parse_instructor(meeting["instructors"])
                    if (meeting["meetingTopicDescription"] and 
                        meeting["meetingTopicDescription"] != ""):
                        meeting_dict["mt_tpc"] = meeting["meetingTopicDescription"]
                    section_dict[meeting_key] = meeting_dict
                
                section_notes = []
                for note in section["notes"]:
                    note_text = note["descrlong"]
                    section_notes.append(note_text)
                    if has_preco(note_text):
                        preco_dict = parse_preco(course["catalogPrereqCoreq"])
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

data = get_all_sessions(LAST_SEMESTER)
with open("sessions", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4)
            
