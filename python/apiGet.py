"""
Author: Raymond Xu
Start Date: February 8, 2025
"""

import requests
from typing import List, Dict, Any, Tuple


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


# def api_get_subjects(semester):
#     api = "https://classes.cornell.edu/api/2.0/config/subjects.json?roster=" + semester
#     response = requests.get(api)
#     if response.status_code == 200:
#         data = response.json()
#         return data
#     elif response.status_code == 404:
#         print(f"{semester} page not found")
#     else:
#         raise Exception(f"Error: {response.status_code}")


# def get(semester,subject,career=None,level=None):
#     """
#     return the obtained api
#     """
#     api = (f"https://classes.cornell.edu/api/2.0/search/"
#            f"classes.json?roster={semester}&subject={subject}")

#     if career:
#         api = api + "&acadCareer[]=" + career

#     if level:
#         api = api + "&classLevels[]=" + level

#     response = requests.get(api)
#     if response.status_code == 200:
#         data = response.json()
#         return data
#     elif response.status_code == 404:
#         print(f"{semester}-{subject} page not found!")
#     else:
#         raise Exception(f"Error: {response.status_code}")
