import os

from firebase_admin import credentials, firestore, initialize_app

base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
key_path = os.path.join(base_dir, "secret-keys\serviceAccountKey.json")
cred = credentials.Certificate(key_path)
initialize_app(cred)
db = firestore.client()


def get_course(course_id):
    course_ref = db.collection("courses").document(course_id)
    course_doc = course_ref.get()
    result = course_doc.to_dict()
    return result


def get_courses_by_subject(subject, min_credit=0, excluded=[], included=[]):
    courses_ref = db.collection("courses")
    query = courses_ref.where("sbj", "==", subject)
    results = query.stream()
    course_ids = []
    for doc in results:
        doc_data = doc.to_dict()
        if doc.id in excluded:
            continue
        qualified = False
        for credit in doc_data["creditsTotal"]:
            if credit >= min_credit:
                qualified = True
                break
        if qualified:
            course_ids.append(doc.id)
        course_ids = course_ids + included
    return course_ids


def get_courses_by_subject_level(
    subject, level, min_credit=0, excluded=[], included=[]
):
    """
    Retrieves the IDs of all courses for a specific subject and level.
    Returns:
        list: A list of course IDs (strings) matching the criteria.
    """
    courses_ref = db.collection("courses")
    query = courses_ref.where("sbj", "==", subject).where("lvl", "==", level)
    results = query.stream()

    course_ids = []
    for doc in results:
        if doc.id in excluded:
            continue
        doc_data = doc.to_dict()
        qualified = False
        for credit in doc_data["creditsTotal"]:
            if credit >= min_credit:
                qualified = True
                break
        if qualified:
            course_ids.append(doc.id)
    course_ids = course_ids + included
    return course_ids


def get_courses_by_subject_min_level(
    subject, min_level, max_level=5, min_credit=0, excluded=[], included=[]
):
    course_ids = []
    for level in range(min_level, max_level + 1):
        courses = get_courses_by_subject_level(subject, level, min_credit, excluded)
        course_ids.extend(courses)

    for course_id in included:
        if course_id not in course_ids:
            course_ids.append(course_id)
    return course_ids


def main():
    print(
        get_courses_by_subject_min_level("ARTH", 3, excluded=["ARTH2000", "ARTH4101"])
    )


if __name__ == "__main__":
    main()
