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


def upload_courses(courses: List[Dict[str, Any]], semester: str, max_level=5) -> None:
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
        if int(course["catalogNbr"][0]) > max_level:
            continue
        course_id = f"{course['subject']}{course['catalogNbr']}"
        subject = course["subject"]

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
            course_data = get_single_course(course, semester)
            batch.set(course_ref, course_data)
            batch_count += 1

        # Process groups
        for group_index, enroll_group in enumerate(course.get("enrollGroups", []), 1):
            group_id = f"{semester}_{course_id}_Grp{group_index}"
            group_data = get_group(enroll_group, group_id, course_id, semester, subject)
            group_ref = db.collection("enrollGroups").document(group_id)
            batch.set(group_ref, group_data)
            batch_count += 1

            # Process sections
            for section in enroll_group.get("classSections", []):
                section_id = (
                    f"{group_id}_{section['ssrComponent']}_{section['section']}"
                )
                section_data = get_section(
                    section, section_id, course_id, group_id, semester, subject
                )
                section_ref = db.collection("sections").document(section_id)
                batch.set(section_ref, section_data)
                batch_count += 1

                # Process meetings
                for i, meeting in enumerate(section.get("meetings", [])):
                    meeting_id = f"{section_id}_meeting{i+1}"
                    meeting_data = get_meeting(
                        meeting,
                        meeting_id,
                        course_id,
                        group_id,
                        section_id,
                        semester,
                        subject,
                    )

                    # Process instructors - only store netIDs in meeting
                    instructors = []
                    if meeting["instructors"]:
                        for instructor in meeting["instructors"]:
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

        print(f"finished {course_id}")

    # Commit any remaining documents
    if batch_count > 0:
        batch.commit()
        print(f"Committed remaining {batch_count} documents")


def get_single_course(course: Dict[str, Any], semester):
    single_course = {}
    course_id = course["subject"] + course["catalogNbr"]

    single_course["id"] = course_id
    single_course["sbj"] = course["subject"]
    single_course["nbr"] = course["catalogNbr"]
    single_course["lvl"] = int(course["catalogNbr"][0])
    single_course["smst"] = [semester]
    single_course["ttl"] = course["titleLong"]
    single_course["tts"] = course["titleShort"]
    single_course["dsrpn"] = clean(course["description"])

    req = clean(course["catalogPrereqCoreq"])
    cmts = clean(course["catalogComments"])
    if cmts:
        if has_recommend_preco(cmts):
            # comment that has recommended prerequisite info
            single_course["rcmdPreco"] = cmts
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
        single_course["needNote"] = preco_dict["note"]

    if course["catalogWhenOffered"]:
        single_course["when"] = parse_when_offered(course["catalogWhenOffered"])
    if course["catalogBreadth"]:
        single_course["breadth"] = course["catalogBreadth"]
    if course["catalogDistr"]:
        single_course["distr"] = parse_distr(course["catalogDistr"])
    if course["catalogAttribute"]:
        single_course["attr"] = parse_distr(course["catalogAttribute"])
    if course["catalogLang"]:
        single_course["lanreq"] = clean(course["catalogLang"])
    if course["catalogForbiddenOverlaps"]:
        single_course["ovlpText"] = clean(course["catalogForbiddenOverlaps"])
        single_course["ovlp"] = parse_overlap(course["catalogForbiddenOverlaps"])
    if course["catalogFee"]:
        single_course["fee"] = clean(course["catalogFee"])
    if course["catalogSatisfiesReq"]:
        single_course["satisfies"] = clean(course["catalogSatisfiesReq"])
    if course["catalogPermission"]:
        single_course["pmsn"] = course["catalogPermission"]
    if course["catalogOutcomes"]:
        single_course["otcm"] = clean_list(course["catalogOutcomes"])
    if course["catalogCourseSubfield"]:
        single_course["subfield"] = clean(course["catalogCourseSubfield"])
    single_course["career"] = course["acadCareer"]
    single_course["acadgrp"] = course["acadGroup"]
    return single_course


def get_group(group, group_id, course_id, semester, subject):
    group_dict = {}
    group_dict["id"] = group_id
    group_dict["courseId"] = course_id
    group_dict["semester"] = semester
    group_dict["sbj"] = subject
    group_dict["credits"] = parse_credit(group["unitsMaximum"], group["unitsMinimum"])
    group_dict["components"] = group["componentsRequired"]
    if group["componentsOptional"]:
        group_dict["componentsOptional"] = group["componentsOptional"]
    group_dict["grading"] = group["gradingBasis"]
    group_dict["sessionCode"] = group["sessionCode"]
    if group["simpleCombinations"]:
        group_dict["comb"] = parse_combinations(group["simpleCombinations"])
    if group["exploreCriteriaIds"]:
        group_dict["criteriaId"] = group["exploreCriteriaIds"]
    return group_dict


def get_section(section, section_id, course_id, group_id, semester, subject):
    section_dict = {}
    section_dict["id"] = section_id
    section_dict["courseId"] = course_id
    section_dict["groupId"] = group_id
    section_dict["semester"] = semester
    section_dict["sbj"] = subject
    section_dict["key"] = f"{section['ssrComponent']}-{section['section']}"
    section_dict["type"] = section["ssrComponent"]
    section_dict["classNbr"] = section["classNbr"]
    if not section["isComponentGraded"]:
        section_dict["graded"] = section["isComponentGraded"]
    if section["openStatus"] != "O":
        section_dict["open"] = section["openStatus"]
    if section["topicDescription"]:
        section_dict["topic"] = section["topicDescription"]
    if section["location"] != "ITH":
        section_dict["location"] = section["location"]
    if section["addConsent"] != "N":
        section_dict["consent"] = section["addConsent"]
    if section["instructionMode"] != "P":
        section_dict["mode"] = section["instructionMode"]
    if section["exploreCriteriaIds"]:
        section_dict["criteriaId"] = section["exploreCriteriaIds"]
    if section["materials"]:
        section_dict["materials"] = section["materials"]

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
            section_dict["needNote"] = json.dumps(preco_dict["note"])
    if section_notes != []:
        section_dict["notes"] = section_notes
    return section_dict


def get_meeting(
    meeting, meeting_id, course_id, group_id, section_id, semester, subject
):
    meeting_dict = {}
    meeting_dict["id"] = meeting_id
    meeting_dict["courseId"] = course_id
    meeting_dict["groupId"] = group_id
    meeting_dict["sectionId"] = section_id
    meeting_dict["semester"] = semester
    meeting_dict["sbj"] = subject
    meeting_dict["tmstart"] = meeting["timeStart"]
    meeting_dict["tmend"] = meeting["timeEnd"]
    meeting_dict["pattern"] = meeting["pattern"]
    meeting_dict["startDt"] = meeting["startDt"]
    meeting_dict["endDt"] = meeting["endDt"]
    if meeting["meetingTopicDescription"]:
        meeting_dict["mtTopic"] = meeting["meetingTopicDescription"]
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


def update_course_credits():
    """
    Add credits information to course documents by aggregating data from enrollment groups.
    """
    # Get all courses from the database
    courses_ref = db.collection("courses")
    courses = courses_ref.stream()

    batch = db.batch()
    batch_count = 0
    MAX_BATCH_SIZE = 200

    for course in courses:
        course_id = course.id
        course_data = course.to_dict()
        semesters = course_data.get("smst", [])

        if not semesters:
            continue

        # Get the latest semester for this course
        latest_semester = semesters[0]  # Assuming semesters are ordered newest first

        # Query all enrollment groups for this course in the latest semester
        query = (
            db.collection("enrollGroups")
            .where("courseId", "==", course_id)
            .where("semester", "==", latest_semester)
        )
        enrollment_groups = query.stream()

        # Collect and combine all credits options
        all_credits = []
        for group in enrollment_groups:
            group_data = group.to_dict()
            group_credits = group_data.get("credits", [])
            for credit in group_credits:
                if credit not in all_credits:
                    all_credits.append(credit)

        # Sort credits in descending order
        all_credits.sort(reverse=True)

        if all_credits:
            # Update the course document with the combined credits
            batch.update(courses_ref.document(course_id), {"creditsTotal": all_credits})
            batch_count += 1

            # Commit batch if we're approaching the limit
            if batch_count >= MAX_BATCH_SIZE:
                batch.commit()
                print(f"Committed batch of {batch_count} course credit updates")
                time.sleep(1)
                batch = db.batch()
                batch_count = 0

    # Commit any remaining updates
    if batch_count > 0:
        batch.commit()
        print(f"Committed remaining {batch_count} course credit updates")


def update_course_instructors():
    """
    Add instructor information to course documents by aggregating data from meetings.
    """
    # Get all courses from the database
    courses_ref = db.collection("courses")
    courses = courses_ref.stream()

    batch = db.batch()
    batch_count = 0
    MAX_BATCH_SIZE = 200

    for course in courses:
        course_id = course.id
        print(f"start {course_id}")
        course_data = course.to_dict()
        semesters = course_data.get("smst", [])

        if not semesters:
            continue

        # Create a dictionary to store instructors by semester
        instructors_by_semester = []

        for semester in semesters:
            # Query all meetings for this course in this semester
            meetings_query = (
                db.collection("meetings")
                .where("courseId", "==", course_id)
                .where("semester", "==", semester)
            )
            meetings = meetings_query.stream()

            # Collect all instructor NetIDs for this semester
            semester_instructors = []
            for meeting in meetings:
                meeting_data = meeting.to_dict()
                instructor_netids = meeting_data.get("instructors", [])
                for netid in instructor_netids:
                    if netid and netid not in semester_instructors:
                        semester_instructors.append(netid)

            if semester_instructors:
                # Add this semester's instructors to the dictionary
                instructors_by_semester.append({semester: semester_instructors})

        if instructors_by_semester:
            # Update the course document with the instructor information
            batch.update(
                courses_ref.document(course_id),
                {"instructors": instructors_by_semester},
            )
            batch_count += 1

            # Commit batch if we're approaching the limit
            if batch_count >= MAX_BATCH_SIZE:
                batch.commit()
                print(f"Committed batch of {batch_count} course instructor updates")
                time.sleep(1)
                batch = db.batch()
                batch_count = 0

    # Commit any remaining updates
    if batch_count > 0:
        batch.commit()
        print(f"Committed remaining {batch_count} course instructor updates")


def add_older_courses(semesters, max_level=5):
    """
    Add courses from older semesters, including credits and instructor data.

    Args:
        semesters: List of older semester codes (e.g., ["SP24", "FA23"])
        max_level: Maximum course level to process (default=5)
    """
    for semester in semesters:
        subjects, courses = fetch_subjects_courses(semester)
        print(
            f"Processing {len(subjects)} subjects and {len(courses)} courses for {semester}"
        )

        upload_subjects(subjects, semester)

        # Process courses but don't store detailed enrollment data
        batch = db.batch()
        batch_count = 0
        MAX_BATCH_SIZE = 200

        for course in courses:
            # Skip courses with level greater than max_level
            if int(course["catalogNbr"][0]) > max_level:
                continue

            course_id = f"{course['subject']}{course['catalogNbr']}"
            print(f"start {course_id}")

            # Extract instructor data for this course in this semester
            instructors_netids = []
            for group in course.get("enrollGroups", []):
                for section in group.get("classSections", []):
                    for meeting in section.get("meetings", []):
                        for instructor in meeting.get("instructors", []):
                            netid = instructor.get("netid", "")
                            if netid and netid not in instructors_netids:
                                instructors_netids.append(netid)
                                # Store instructor data
                                instructor_data = get_instructor(instructor)
                                instructor_ref = db.collection("instructors").document(
                                    netid
                                )
                                batch.set(instructor_ref, instructor_data, merge=True)
                                batch_count += 1

            # Check if the course already exists
            course_ref = db.collection("courses").document(course_id)
            course_doc = course_ref.get()

            if course_doc.exists:
                # Course exists, update semester list and add instructors
                existing_data = course_doc.to_dict()

                # Update semester list
                semesters_list = existing_data.get("smst", [])
                if semester not in semesters_list:
                    semesters_list.append(semester)

                # Update instructor list
                if instructors_netids:
                    instructors_list = existing_data.get("instructors", [])
                    # Check if we already have instructors for this semester
                    semester_exists = False
                    for i, item in enumerate(instructors_list):
                        if semester in item:
                            # Update existing semester entry
                            existing_netids = item[semester]
                            for netid in instructors_netids:
                                if netid not in existing_netids:
                                    existing_netids.append(netid)
                            instructors_list[i] = {semester: existing_netids}
                            semester_exists = True
                            break

                    # If this semester isn't in the list yet, add it
                    if not semester_exists:
                        instructors_list.append({semester: instructors_netids})

                    # Update the course with both semester and instructor changes
                    batch.update(
                        course_ref,
                        {"smst": semesters_list, "instructors": instructors_list},
                    )
                else:
                    # Just update the semester list if no instructors found
                    batch.update(course_ref, {"smst": semesters_list})

                batch_count += 1
            else:
                # New course, create full document
                course_data = get_single_course(course, semester)

                # Extract credits from enrollment groups
                all_credits = []
                for group in course.get("enrollGroups", []):
                    group_credits = parse_credit(
                        group["unitsMaximum"], group["unitsMinimum"]
                    )
                    for credit in group_credits:
                        if credit not in all_credits:
                            all_credits.append(credit)

                # Sort credits in descending order
                all_credits.sort(reverse=True)
                if all_credits:
                    course_data["creditsTotal"] = all_credits

                # Add instructor data if available
                if instructors_netids:
                    course_data["instructors"] = [{semester: instructors_netids}]

                batch.set(course_ref, course_data)
                batch_count += 1

            # Commit batch if we're approaching the limit
            if batch_count >= MAX_BATCH_SIZE:
                batch.commit()
                print(f"Committed batch of {batch_count} documents for older semester")
                time.sleep(1.5)
                batch = db.batch()
                batch_count = 0

        # Commit any remaining documents
        if batch_count > 0:
            batch.commit()
            print(f"Committed remaining {batch_count} documents for older semester")

        print(f"Completed processing for older semester {semester}\n")


def remove_high_level_courses(max_level=5):
    """
    Remove only course documents with levels higher than the specified maximum level.
    Leaves instructor documents intact.

    Args:
        max_level: Maximum level to keep (default=5)
    """
    print(f"Finding courses with level > {max_level} to remove...")

    # Query for high-level courses
    high_level_query = db.collection("courses").where("lvl", ">", max_level)
    high_level_courses = high_level_query.stream()

    # Start a batch delete
    batch = db.batch()
    batch_count = 0
    MAX_BATCH_SIZE = 200

    removed_count = 0

    # Delete course documents
    for course in high_level_courses:
        course_id = course.id
        print(f"Removing course: {course_id}")

        # Delete the course document
        course_ref = db.collection("courses").document(course_id)
        batch.delete(course_ref)
        batch_count += 1
        removed_count += 1

        # Process batch if needed
        if batch_count >= MAX_BATCH_SIZE:
            batch.commit()
            print(f"Committed batch of {batch_count} deletions")
            time.sleep(1.5)
            batch = db.batch()
            batch_count = 0

    # Commit any remaining deletions
    if batch_count > 0:
        batch.commit()
        print(f"Committed remaining {batch_count} course deletions")

    print(f"Completed removing {removed_count} high-level courses")
    print("Instructor documents were not removed.")


def add_instructors_to_all_courses(semesters, max_level=5):
    """
    Query each semester's courses from the API, extract instructor data,
    and add it to the corresponding course documents in Firestore.
    Skips semesters that already have instructor data.
    Maintains semester order from present to past.

    Args:
        semesters: List of semester codes to process in chronological order
                  (e.g., ["SP25", "WI25", "FA24", "SU24", ...])
        max_level: Maximum course level to process (default=5)
    """
    print(
        f"Starting to add instructors to all courses from API data (max level: {max_level})..."
    )

    # Define semester order from newest to oldest
    semester_order = [
        "SP25",
        "WI25",
        "FA24",
        "SU24",
        "SP24",
        "WI24",
        "FA23",
        "SU23",
        "SP23",
        "WI23",
        "FA22",
        "SU22",
        "SP22",
    ]

    for semester in semesters:
        print(f"Processing semester {semester}...")

        # Fetch all courses for this semester from the API
        _, courses = fetch_subjects_courses(semester)
        print(f"Fetched {len(courses)} courses for {semester}")

        batch = db.batch()
        batch_count = 0
        MAX_BATCH_SIZE = 200

        # Process each course from the API
        for course in courses:
            # Skip courses with level greater than max_level
            if int(course["catalogNbr"][0]) > max_level:
                continue

            course_id = f"{course['subject']}{course['catalogNbr']}"

            # Find the course document in Firestore
            course_ref = db.collection("courses").document(course_id)
            course_doc = course_ref.get()

            if not course_doc.exists:
                print(f"  Course {course_id} not found in database, skipping")
                continue

            # Get existing course data
            course_data = course_doc.to_dict()
            instructors_list = course_data.get("instructors", [])

            # Check if we already have instructors for this semester
            semester_exists = False
            for item in instructors_list:
                if semester in item:
                    # Skip this semester as it already has instructor data
                    semester_exists = True
                    break

            if semester_exists:
                print(
                    f"  Skipping {course_id} - already has instructor data for {semester}"
                )
                continue

            print(f"Processing {course_id} for {semester}")

            # Extract instructor data from this API course
            instructors_netids = []
            for group in course.get("enrollGroups", []):
                for section in group.get("classSections", []):
                    for meeting in section.get("meetings", []):
                        for instructor in meeting.get("instructors", []):
                            netid = instructor.get("netid", "")
                            if netid and netid not in instructors_netids:
                                instructors_netids.append(netid)
                                # Store/update instructor data
                                instructor_data = get_instructor(instructor)
                                instructor_ref = db.collection("instructors").document(
                                    netid
                                )
                                batch.set(instructor_ref, instructor_data, merge=True)
                                batch_count += 1

            if not instructors_netids:
                print(f"  No instructors found for {course_id} in {semester}")
                continue

            # Add this semester's instructors to the list and maintain order
            new_instructor_entry = {semester: instructors_netids}

            # Create a new ordered list
            ordered_instructors = []
            added_current = False

            # Find where to insert the new semester based on the defined order
            current_semester_index = (
                semester_order.index(semester) if semester in semester_order else -1
            )

            # Go through the defined semester order
            for ordered_semester in semester_order:
                # First check if the current semester should be added here
                if not added_current and current_semester_index >= 0:
                    if semester_order.index(ordered_semester) >= current_semester_index:
                        ordered_instructors.append(new_instructor_entry)
                        added_current = True

                # Now check if any existing semesters match this point in the order
                for item in instructors_list:
                    if ordered_semester in item:
                        ordered_instructors.append(item)
                        break

            # If still not added (would be strange but possible if semester not in order list)
            if not added_current:
                ordered_instructors.append(new_instructor_entry)

            # Update the course with the ordered instructor data
            batch.update(course_ref, {"instructors": ordered_instructors})
            batch_count += 1
            print(
                f"  Updated {course_id} with {len(instructors_netids)} instructors for {semester}"
            )

            # Commit batch if we're approaching the limit
            if batch_count >= MAX_BATCH_SIZE:
                batch.commit()
                print(f"Committed batch of {batch_count} updates")
                time.sleep(1.5)
                batch = db.batch()
                batch_count = 0

        # Commit any remaining updates
        if batch_count > 0:
            batch.commit()
            print(f"Committed remaining {batch_count} updates for {semester}")

        print(f"Completed processing for semester {semester}")

    print("Completed adding instructors to all courses")


def main():
    """Process and upload course data for all semesters."""
    CURRENT_YEAR = ["SP25", "WI25", "FA24", "SU24"]
    ADDED = ["SP24", "WI24", "FA23", "SU23", "SP23", "WI23", "FA22", "SU22", "SP22"]
    TO_BE_ADDED = [
        "WI22",
        "FA21",
        "SU21",
        "SP21",
        "WI21",
        "FA20",
        "SU20",
    ]
    # for semester in CURRENT_YEAR:
    #     subjects, courses = fetch_subjects_courses(semester)
    #     print(
    #         f"Processing {len(subjects)} subjects and {len(courses)} courses for {semester}"
    #     )
    #     upload_subjects(subjects, semester)
    #     upload_courses(courses, semester)
    #     print(f"Completed processing for {semester}\n")
    # update_course_credits()
    # update_course_instructors()
    # add_older_courses(TO_BE_ADDED)
    add_older_courses(TO_BE_ADDED)


if __name__ == "__main__":
    main()
