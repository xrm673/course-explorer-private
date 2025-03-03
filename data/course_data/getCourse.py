"""
Author: Raymond Xu
Start Date: February 8, 2025
"""

import firebase_admin
from firebase_admin import credentials, firestore
import json
import sys
import os
from parseText import *
import requests
from typing import List, Dict, Any, Tuple
import time

# store the path of the original directory
init_sys_path = sys.path.copy()

# moves two levels up (to the project directory)
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from constants import *

# moves one more level up (outside the project directory to get account key)
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
key_path = os.path.join(base_dir, "secret-keys\serviceAccountKey.json")
cred = credentials.Certificate(key_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

# go back to the original directory
sys.path = init_sys_path


def fetch_subjects_courses(
    semester: str,
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Fetch subject and course data from class roster API for a specific semester.

    Args:
        semester: The semester code (e.g., "SP25")

    Returns:
        Tuple containing:
            - List of subject dictionaries
            - List of course data dictionaries
    """
    print(f"Fetching data for {semester}...")

    # Step 1: Fetch subjects from the subjects API
    subjects_url = (
        f"https://classes.cornell.edu/api/2.0/config/subjects.json?roster={semester}"
    )
    subjects_response = requests.get(subjects_url)

    if subjects_response.status_code != 200:
        print(
            f"Error fetching subjects for {semester}: {subjects_response.status_code}"
        )
        return [], []

    subjects_data = subjects_response.json()
    if subjects_data.get("status") != "success":
        print(
            f"API error for subjects in {semester}: {subjects_data.get('message', 'Unknown error')}"
        )
        return [], []

    subjects = subjects_data["data"]["subjects"]
    print(f"Fetched {len(subjects)} subjects for {semester}")

    # Step 2: Fetch courses for each subject
    all_courses = []
    for subject in subjects:
        subject_code = subject["value"]
        course_url = f"https://classes.cornell.edu/api/2.0/search/classes.json?roster={semester}&subject={subject_code}"
        course_response = requests.get(course_url)

        if (
            course_response.status_code == 200
            and course_response.json()["status"] == "success"
        ):
            courses = course_response.json()["data"]["classes"]
            all_courses.extend(courses)
            print(f"Fetched {len(courses)} courses for {subject_code} in {semester}")

    return subjects, all_courses


def upload_subjects(subjects: List[Dict[str, Any]], semester: str) -> None:
    """
    Process subject data and upload to Firestore.
    Only adds subjects that don't already exist.

    Args:
        subjects: List of subject data from the API
        semester: The semester code (e.g., "SP25")
    """
    # Process subjects with proper names from the API
    subject_batch = db.batch()
    subject_count = 0
    subjects_added = 0

    for subject in subjects:
        subject_code = subject["value"]

        # Check if subject already exists
        subject_ref = db.collection("subjects").document(subject_code)
        if not subject_ref.get().exists:
            # Subject doesn't exist, add it
            subject_data = {
                "code": subject_code,
                "name": subject["descr"],
                "formalName": subject["descrformal"],
            }

            subject_batch.set(subject_ref, subject_data)
            subject_count += 1
            subjects_added += 1

            # Commit in smaller batches if needed
            if subject_count >= 200:
                subject_batch.commit()
                subject_batch = db.batch()
                subject_count = 0

    # Commit any remaining subjects
    if subject_count > 0:
        subject_batch.commit()

    print(f"Added {subjects_added} new subjects for {semester}")


def upload_courses(courses: List[Dict[str, Any]], semester: str) -> None:
    """
    Process course data and upload to Firestore with semester tracking.
    Includes enrollment groups, sections, meetings, and instructors.

    Args:
        courses: List of course data from the API
        semester: The semester code (e.g., "SP25")
    """
    # Track batch operations to stay within Firestore limits
    batch = db.batch()
    batch_count = 0
    MAX_BATCH_SIZE = 200

    # Process and upload courses with semester tracking
    for course in courses:
        course_id = f"{course['subject']}{course['catalogNbr']}"

        # Check if the course already exists
        course_ref = db.collection("courses").document(course_id)
        course_doc = course_ref.get()

        if course_doc.exists:
            # Course exists, just add the semester if not already present
            existing_data = course_doc.to_dict()
            semesters = existing_data.get("smst", [])
            if semester not in semesters:
                semesters.append(semester)
                batch.update(course_ref, {"smst": semesters})
                batch_count += 1
        else:
            # New course, create full document
            course_data = get_single_course(course)
            batch.set(course_ref, course_data)
            batch_count += 1

        # Process groups
        for group_index, enroll_group in enumerate(course.get("enrollGroups", []), 1):
            group_id = f"{semester}_{course_id}_Grp{group_index}"
            group_data = get_group(enroll_group, group_id, course_id, semester)
            group_ref = db.collection("enrollGroups").document(group_id)
            batch.set(group_ref, group_data)
            batch_count += 1

            # Process sections
            for section in enroll_group.get("classSections", []):
                section_id = (
                    f"{group_id}_{section['ssrComponent']}-{section['section']}"
                )
                section_data = get_section(
                    section, section_id, course_id, group_id, semester
                )
                section_ref = db.collection("sections").document(section_id)
                batch.set(section_ref, section_data)
                batch_count += 1

                # Process meetings
                for i, meeting in enumerate(section.get("meetings", [])):
                    meeting_id = f"{section_id}_meeting{i+1}"
                    meeting_data = get_meeting(
                        meeting, meeting_id, course_id, group_id, section_id, semester
                    )

                    # Process instructors - only store netIDs in meeting
                    instructors = []
                    for instructor in meeting.get("instructors", []):
                        netid = instructor.get("netid", "")
                        if netid:
                            instructors.append(netid)
                            # Store instructor data in separate collection
                            instructor_data = get_instructor(instructor)
                            instructor_ref = db.collection("instructors").document(
                                netid
                            )
                            batch.set(instructor_ref, instructor_data, merge=True)
                            batch_count += 1

                    # Only store the instructor IDs in the meeting
                    meeting_data["instructors"] = instructors
                    meeting_ref = db.collection("meetings").document(meeting_id)
                    batch.set(meeting_ref, meeting_data)
                    batch_count += 1

                # Commit batch if we're approaching the limit
                if batch_count >= MAX_BATCH_SIZE:
                    batch.commit()
                    print(f"Committed batch of {batch_count} documents")
                    time.sleep(1.5)
                    batch = db.batch()
                    batch_count = 0

    # Commit any remaining documents
    if batch_count > 0:
        batch.commit()
        print(f"Committed remaining {batch_count} documents")


def get_single_course(course: Dict[str, Any]):
    single_course = {}
    course_id = course["subject"] + course["catalogNbr"]

    single_course["id"] = course_id
    single_course["sbj"] = course["subject"]
    single_course["nbr"] = course["catalogNbr"]
    single_course["ttl"] = course["titleLong"]
    single_course["tts"] = course["titleShort"]
    single_course["dsrpn"] = clean(course["description"])

    req = clean(course["catalogPrereqCoreq"])
    cmts = clean(course["catalogComments"])
    if cmts:
        if has_recommend_preco(cmts):
            # comment that has recommended prerequisite info
            single_course["rcmd_preco"] = cmts
        elif has_preco(cmts) and not req:
            # comment that has prerequisite info
            req = cmts
        else:
            # regular comments that don't have any prerequisite info
            single_course["cmts"] = cmts

    if req:
        single_course["req"] = req
        preco_dict = parse_preco(req)
        if preco_dict["prereq"]:
            single_course["prereq"] = json.dumps(preco_dict["prereq"])
        if preco_dict["coreq"]:
            single_course["coreq"] = json.dumps(preco_dict["coreq"])
        if preco_dict["preco"]:
            single_course["preco"] = json.dumps(preco_dict["preco"])
        single_course["note"] = preco_dict["note"]

    when = parse_when_offered(course["catalogWhenOffered"])
    if when:
        single_course["when"] = when
    if course["catalogBreadth"]:
        single_course["breadth"] = course["catalogBreadth"]
    if parse_distr(course["catalogDistr"]):
        single_course["distr"] = parse_distr(course["catalogDistr"])
    if parse_distr(course["catalogAttribute"]):
        single_course["attr"] = parse_distr(course["catalogAttribute"])
    if clean(course["catalogLang"]):
        single_course["lanreq"] = course["catalogLang"]
    if parse_overlap(course["catalogForbiddenOverlaps"]):
        single_course["ovlp"] = parse_overlap(course["catalogForbiddenOverlaps"])
    if clean(course["catalogFee"]):
        single_course["fee"] = course["catalogFee"]
    if clean(course["catalogSatisfiesReq"]):
        single_course["satisfies"] = course["catalogSatisfiesReq"]
    if clean(course["catalogPermission"]):
        single_course["pmsn"] = clean(course["catalogPermission"])
    if clean_list(course["catalogOutcomes"]):
        single_course["otcm"] = clean_list(course["catalogOutcomes"])
    if clean(course["catalogCourseSubfield"]):
        single_course["subfield"] = course["catalogCourseSubfield"]
    single_course["career"] = course["acadCareer"]
    single_course["acadgrp"] = course["acadGroup"]
    return single_course


def get_group(group, group_id, course_id, semester):
    group_dict = {}
    group_dict["id"] = group_id
    group_dict["course_id"] = course_id
    group_dict["semester"] = semester
    group_dict["credits"] = parse_credit(group["unitsMaximum"], group["unitsMinimum"])
    group_dict["components"] = group["componentsRequired"]
    if group["componentsOptional"] != []:
        group_dict["componentsOptional"] = group["componentsOptional"]
    group_dict["gradingBasis"] = group["gradingBasis"]
    group_dict["session_code"] = group["sessionCode"]
    if group["simpleCombinations"] != []:
        group_dict["combinations"] = group["simpleCombinations"]
    return group_dict


def get_section(section, section_id, course_id, group_id, semester):
    section_dict = {}
    section_dict["id"] = section_id
    section_dict["course_id"] = course_id
    section_dict["group_id"] = group_id
    section_dict["semester"] = semester
    section_dict["key"] = f"{section['ssrComponent']}-{section['section']}"
    section_dict["type"] = section["ssrComponent"]
    if section["openStatus"] != "O":
        section_dict["open"] = section["openStatus"]
    if section["topicDescription"] != "":
        section_dict["topic"] = section["topicDescription"]
    if section["location"] != "ITH":
        section_dict["location"] = section["location"]
    if section["addConsent"] != "N":
        section_dict["consent"] = section["addConsent"]
    if section["instructionMode"] != "P":
        section_dict["mode"] = section["instructionMode"]

    section_notes = []
    for note in section["notes"]:
        note_text = note["descrlong"]
        section_notes.append(note_text)
        if has_preco(note_text):
            preco_dict = parse_preco(note_text)
            if preco_dict["prereq"]:
                section_dict["prereq"] = json.dumps(preco_dict["prereq"])
            if preco_dict["coreq"]:
                section_dict["coreq"] = json.dumps(preco_dict["coreq"])
            if preco_dict["preco"]:
                section_dict["preco"] = json.dumps(preco_dict["preco"])
            section_dict["need_note"] = json.dumps(preco_dict["note"])
    if section_notes != []:
        section_dict["notes"] = section_notes
    return section_dict


def get_meeting(meeting, meeting_id, course_id, group_id, section_id, semester):
    meeting_dict = {}
    meeting_dict["id"] = meeting_id
    meeting_dict["course_id"] = course_id
    meeting_dict["group_id"] = group_id
    meeting_dict["section_id"] = section_id
    meeting_dict["semester"] = semester
    meeting_dict["tmstart"] = meeting["timeStart"]
    meeting_dict["tmend"] = meeting["timeEnd"]
    meeting_dict["pattern"] = meeting["pattern"]
    meeting_dict["start_dt"] = meeting["startDt"]
    meeting_dict["end_dt"] = meeting["endDt"]
    if meeting["meetingTopicDescription"]:
        meeting_dict["mt_tpc"] = meeting["meetingTopicDescription"]
    return meeting_dict


def get_instructor(instructor):
    # Get name components
    netid = instructor.get("netid", "")
    first_name = instructor.get("firstName", "")
    middle_name = instructor.get("middleName", "")
    last_name = instructor.get("lastName", "")

    # Build full name with middle name if available
    full_name_parts = [first_name]
    if middle_name:
        full_name_parts.append(middle_name)
    full_name_parts.append(last_name)
    full_name = " ".join(filter(None, full_name_parts))

    # Store instructor data in separate collection
    instructor_dict = {
        "netid": netid,
        "firstName": first_name,
        "middleName": middle_name,
        "lastName": last_name,
        "fullName": full_name,
    }
    return instructor_dict


def main():
    """Process and upload course data for all semesters."""
    for semester in CURRENT_YEAR:
        subjects, courses = fetch_subjects_courses(semester)
        print(
            f"Processing {len(subjects)} subjects and {len(courses)} courses for {semester}"
        )
        upload_subjects(subjects, semester)
        upload_courses(courses, semester)
        print(f"Completed processing for {semester}\n")


if __name__ == "__main__":
    main()
