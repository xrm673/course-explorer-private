"""
Author: Raymond Xu
Start Date: January 10, 2025
"""

from course import *
import os
import json

filepath = os.path.join(COURSE_DATA_ROUTE, "combined_am.json")
with open(filepath, "r") as file:
    course_data_am = json.load(file)

filepath = os.path.join(COURSE_DATA_ROUTE, "combined_nz.json")
with open(filepath, "r") as file:
    course_data_nz = json.load(file)

filepath = os.path.join(SESSION_DATA_ROUTE, "SP_session.json")
with open(filepath, "r") as file:
    SP_session = json.load(file)

filepath = os.path.join(SESSION_DATA_ROUTE, "FA_session.json")
with open(filepath, "r") as file:
    FA_session = json.load(file)

filepath = os.path.join(SESSION_DATA_ROUTE, "SU_session.json")
with open(filepath, "r") as file:
    SU_session = json.load(file)

filepath = os.path.join(SESSION_DATA_ROUTE, "WI_session.json")
with open(filepath, "r") as file:
    WI_session = json.load(file)


def only_level(course_data, subject, level, min_credit=3, excluded=[], included=[]):
    result = []
    for course_code in course_data[subject]:
        if course_code[0] in A_TO_M:
            course_created = Course.create(
                course_code,
                course_data_am,
                SP_session,
                FA_session,
                SU_session,
                WI_session,
            )
        else:
            course_created = Course.create(
                course_code,
                course_data_nz,
                SP_session,
                FA_session,
                SU_session,
                WI_session,
            )
        if (not course_code in excluded) and (course_created.get_level() == level):
            max_crd = course_created.get_max_credit()
            if max_crd and max_crd >= min_credit:
                result.append(course_code)
    result = result + included
    return result


# helper for level_required,
def level(course_data, subject, min_level, min_credit=3, excluded=[], included=[]):
    """
    return a list with all courses that meet the level requirement in a subject
    """
    result = []
    for course_code in course_data[subject]:
        if match_level(course_code, subject, min_level, min_credit, excluded):
            result.append(course_code)
    result = result + included
    return result


# helper for app.level, app.level_taken
# helper for majorImportance.match_level_requirement
def match_level(course_code, subject, min_level, min_credit=3, excluded=[]):
    """
    return true if the course match the level requirement of a subject
    """
    if course_code in excluded:
        return False
    if course_code[0] in A_TO_M:
        course_created = Course.create(
            course_code, course_data_am, SP_session, FA_session, SU_session, WI_session
        )
    else:
        course_created = Course.create(
            course_code, course_data_nz, SP_session, FA_session, SU_session, WI_session
        )
    if (
        course_created.get_subject() == subject
        and course_created.get_level() >= min_level
    ):
        max_crd = course_created.get_max_credit()
        if max_crd and (max_crd >= min_credit):
            return True
    return False


def find_CS4XX1(course_data):
    result = []
    for course_code in course_data["CS"]:
        if course_code[2] == "4" and course_code[-1] == "1":
            result.append(course_code)
    return result


# def level_required(
#     course_data,
#     courses_taken,
#     subject,
#     min_level,
#     min_credit,
#     number,
#     excluded=[],
#     included=[],
# ):
#     """
#     return the courses that have fulfilled the level requirement and the courses
#     that can be used to fulfill the requirement. If the requirement has been
#     fulfilled, the second list is empty
#     """
#     fulfilled = level_taken(
#         course_data, courses_taken, subject, min_level, min_credit, excluded, included
#     )
#     not_fulfilled = []
#     if len(fulfilled_courses) >= number:
#         return fulfilled, not_fulfilled
#     for course in level(
#         course_data, subject, min_level, min_credit, excluded, included
#     ):
#         if not course in fulfilled:
#             not_fulfilled.append(course)
#     return fulfilled, not_fulfilled


# def data_level(subject, major_data, course_data, college, category):
#     min_level = major_data[college][category]["min_level"]
#     included = major_data[college][category]["included"]
#     excluded = major_data[college][category]["excluded"]
#     min_credit = major_data[college][category]["min_credit"]
#     return level(course_data, subject, min_level, min_credit, excluded, included)


# # helper for level_required
# def level_taken(
#     course_data, courses_taken, subject, min_level, min_credit, excluded=[], included=[]
# ):
#     """
#     return a list of courses taken that fulfilled the level requirement
#     """
#     result = []
#     for course_code in courses_taken:
#         if level.match_level(
#             course_data, course_code, subject, min_level, min_credit, excluded, included
#         ):
#             result.append(course_code)
#     return result


# def data_match_level(course_data, major_data, course_code, college, subject, category):
#     """
#     return true if the course match the level requirement of a subject
#     """
#     min_level = major_data[college][category]["min_level"]
#     included = major_data[college][category]["included"]
#     excluded = major_data[college][category]["excluded"]
#     min_credit = major_data[college][category]["min_credit"]
#     return match_level(
#         course_data, course_code, subject, min_level, min_credit, excluded, included
#     )


# def data_only_level(course_data, major_data, college, subject, category):
#     level = major_data[college][category]["level"]
#     included = major_data[college][category]["included"]
#     excluded = major_data[college][category]["excluded"]
#     min_credit = major_data[college][category]["min_credit"]
#     return only_level(course_data, subject, level, min_credit, excluded, included)
