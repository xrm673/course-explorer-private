"""
Author: Raymond Xu
Start Date: February 8, 2025
"""

import re


def clean(text):
    if not text or text == "":
        return None
    text = text.replace("\xa0", " ").replace("—", "--").strip()
    return text


def parse_distr(text):
    """
    Return a list that contains each distribution category as individual element

    Precondition: text is a str
    """
    text = clean(text)
    if not text:
        return None
    matches = re.findall(r"\(([^)]+)\)", text)
    result = []
    for categories in matches:
        result.extend([category.strip() for category in categories.split(",")])
    return result


def parse_when_offered(text):
    text = clean(text)
    if not text:
        return None
    words = re.findall(r"\b\w+\b", text)
    return words


def clean_list(list):
    if not list or list == []:
        return None
    result = []
    for line in list:
        line = line.replace("\xa0", " ").replace("—", "--").strip()
        result.append(line)
    return result


def has_recommend_preco(text):
    if "Recommended prerequisite:" in text or "recommended prerequisite:" in text:
        return True
    return False


def has_preco(text):
    if (
        "Prerequisite:" in text
        or "prerequisite:" in text
        or "Corequisite:" in text
        or "corequisite:" in text
        or "Prerequisite or corequisite:" in text
        or "prerequisite or corequisite:" in text
    ):
        return True
    return False


def parse_preco(text):
    details = {"prereq": None, "coreq": None, "preco": None, "note": False}
    text = clean(text)
    if not text:
        return details

    preco_list = separate_prereq(text)

    prerequisite = convert_prerequisites(preco_list[0])
    details["prereq"] = prerequisite[:-1]

    coreq = convert_prerequisites(preco_list[1])
    details["coreq"] = coreq[:-1]

    precoreq = convert_prerequisites(preco_list[2])
    details["preco"] = precoreq[:-1]

    last_pre = prerequisite[-1] if prerequisite else None
    last_co = coreq[-1] if coreq else None
    last_preco = precoreq[-1] if precoreq else None
    need_note = last_pre or last_co or last_preco
    if need_note == None:
        need_note = False
    details["note"] = need_note
    return details


def separate_prereq(text):
    """
    Return a list that separates prereq and coreq

    Use re search to find "Prerequisite:", "Corequisite:", and
    "Prerequisite or corequisite:", append words follow them in a list.

    Parameter text: text is the string that would be separated
    Precondition: text is a str object
    """
    text = text.replace("Prerequisite: ", "A_Prerequisite: ")
    text = text.replace(
        "Prerequisite or corequisite: ", "B_Prerequisite or corequisite: "
    )
    text = text.replace("Corequisite: ", "C_Corequisite: ")

    prereq_match = re.search(
        r"a_prerequisite:(.*?)(b_prerequisite or corequisite|c_corequisite|$)",
        text,
        re.IGNORECASE,
    )

    prereq_or_coreq_match = re.search(
        r"b_prerequisite or corequisite:(.*?)(c_corequisite|$)", text, re.IGNORECASE
    )

    coreq_match = re.search(r"c_corequisite:(.*)", text, re.IGNORECASE)

    result = []

    prereq = prereq_match.group(1).strip() if prereq_match else None
    result.append(prereq)

    coreq = coreq_match.group(1).strip() if coreq_match else None
    result.append(coreq)

    if prereq_or_coreq_match:
        prereq_or_coreq = prereq_or_coreq_match.group(1).strip()
    else:
        prereq_or_coreq = None
    result.append(prereq_or_coreq)

    return result


def convert_prerequisites(prereq_text):
    """
    Convert prerequisite text into a nested list, with the last element of the
    nested list indicating whether it needs further explanation.
    "A or B and C" should be converted to [[A,B],C]

    If the prereq text is in format "topic (e.g. course1, course2)", or
    "1) topic: ...; 2) topic ..." only keep the topic part and replace the topic
    into several specified courses. For example, "linear algebra" is replaced by
    "MATH 2210 or MATH 2310 or MATH 2940".

    For text in "a, b, c, or d" structures, replace each comma with "or";
    for text in "a, b, c or d" structures, replace each comma with "and";
    for "a/b", replace "/" with "or"; replace each ";" with "and".

    Split each text by "and", and then split each sub-text by "or". Only keep
    the course code part in the text and append them into a nested list. Remove
    any repeated course in the nested list.

    Parameter prereq_text: The raw prerequisite text.
    Precondition: a str from Cornell's class roster
    """
    if not prereq_text:
        return []

    prereq_text = prereq_text.replace("\xa0", " ")
    note = False

    patterns = [
        (r"\(.*?\)", ""),
        (r"For\s.*?majors[:;].*?[.;]", ""),
        (r"Note:.*?;", ""),
        (r"[A-Za-z\s]+(?:degree|experience),", ""),
        (r"([A-Z]+\s\d{4})-([A-Z]+\s\d{4})", r"\2"),
    ]
    for pattern, replace in patterns:
        if re.search(pattern, prereq_text, flags=re.IGNORECASE):
            prereq_text = re.sub(pattern, replace, prereq_text, flags=re.IGNORECASE)
            note = True

    if re.search(r"\d\)\s*.*?:", prereq_text):
        # print("1)")
        # check structure "1)...; 2)...; 3)...;
        matches = re.findall(r"\d\)\s*(.*?):", prereq_text)
        topics = [match.strip() for match in matches]
        prereq_text = " and ".join(topics)
        note = True
    if prereq_text.find(", or permission of the instructor.") != -1:
        # print("instructor")
        prereq_text = prereq_text.replace(", or permission of the instructor.", "")
        note = True
    if prereq_text.find(", or permission of instructor.") != -1:
        # print("instructor")
        prereq_text = prereq_text.replace(", or permission of instructor.", "")
        note = True
    if prereq_text.find("performance") != -1 or prereq_text.find("excellent") != -1:
        # print("performance")
        note = True

    if re.search(r",\s*or\s", prereq_text):
        # check structure A, B, or C
        prereq_text = re.sub(r",(?=\s*[^o])", " or ", prereq_text)
        # replace "," with " or "

    prereq_text = re.sub(r"[;,]\s*$", "", prereq_text)  # remove trailing semicolons

    prereq_text = prereq_text.replace(", ", " and ")
    prereq_text = prereq_text.replace(";", " and ")
    prereq_text = prereq_text.replace("/", " or ")

    replacements = {
        "linear algebra": "MATH 2210 or MATH 2230 or MATH 2310 or MATH 2940",
        "single-variable calculus": "MATH 1910 or MATH 1120",
        "calculus": "MATH 1120 or MATH 1910 or MATH 1920 or MATH 2220 or MATH 2240",
        "multi-variable calculus": "MATH 1920 or MATH 2220 or MATH 2240",
        "core statistics": "STSCI 2100 or MATH 1710",
        "probability theory": (
            "BTRY 3080 or CS 2800 or ECON 3130 or ENGRD 2700 or " "MATH 4710"
        ),
        "one programming course": "CS 1110 or CS 1112 or CS 1132 or CS 1133",
        "knowledge of programming": "CS 1110 or CS 1112 or CS 1132 or CS 1133",
        "core programming": "CS 1110 or CS 1112",
        "Python": "CS 1110 or CS 1112 or CS 1133",
        "MATLAB": "CS 1132",
        "C++": "CS 2024",
        "programming proficiency": "CS 2110 or CS 2112",
        "proficient with programming": "CS 2110 or CS 2112",
        "data structures": "CS 2110 or CS 2112",
        "discrete math": "CS 2800",
        "discrete mathematics": "CS 2800",
        "introductory ML course": "CS 3780",
        "numerical methods": "CS 4210 or CS 4220",
    }

    for topic, course in replacements.items():
        if re.search(rf"\b{re.escape(topic)}\b", prereq_text, flags=re.IGNORECASE):
            prereq_text = re.sub(
                rf"\b{re.escape(topic)}\b", course, prereq_text, flags=re.IGNORECASE
            )
            note = True

    and_split = re.split(r"\s+and\s+", prereq_text)
    or_split = [re.split(r"\s+or\s+", item) for item in and_split]

    # Matches patterns like "CS 1110", "MATH 1920"
    course_code_pattern = r"[A-Z]{2,10}\s\d{4}"
    nested_list = []
    for group in or_split:
        course_list = [
            re.sub(r"\s", "", match.group())  # Remove spaces in matched course codes
            for item in group
            for match in re.finditer(course_code_pattern, item)
        ]
        nested_list.append(course_list)
    for sublist in nested_list:
        if len(sublist) == 0:
            # print("empty")
            note = True
    cleaned_list = [sublist for sublist in nested_list if sublist]
    result = remove_repeat(cleaned_list)
    result.append(note)
    return result


def remove_repeat(nested_list):
    """
    Return a nested list with repeated element removed

    It first checks and removes repeated sublists, and then it checks and
    removes repeated individual element in the nested list.

    Parameters nested_list: A nested list of courses.
    Precondition: nested_list is a 2D list
    """
    unique_sublists = list(set(map(tuple, nested_list)))

    nested_list = [list(sublist) for sublist in unique_sublists]

    course_to_sublist = {}

    nested_list_sorted = sorted(nested_list, key=len)

    for sublist in nested_list_sorted:
        for course in sublist:
            if course not in course_to_sublist:
                course_to_sublist[course] = sublist

    result = []
    for sublist in nested_list:
        unique_courses = [
            course for course in sublist if course_to_sublist[course] == sublist
        ]
        result.append(unique_courses)

    return result


def parse_overlap(text):
    text = clean(text)
    if not text:
        return None

    course_code_pattern = r"[A-Z]{2,10}\s\d{4}"
    course_list = [
        re.sub(r"\s", "", match.group())  # Remove spaces in matched course codes
        for match in re.finditer(course_code_pattern, text)
    ]
    return course_list


def parse_instructor(l):
    result = {}
    for instructor in l:
        if instructor["middleName"] != "":
            name = f"{instructor['firstName']} {instructor['middleName']} {instructor['lastName']}"
        else:
            name = f"{instructor['firstName']} {instructor['lastName']}"
        result[instructor["netid"]] = name
    return result


def parse_credit(crdmax, crdmin):
    """
    crdmax and crdmin are int
    """
    result = [crdmax]
    while crdmax > crdmin:
        crdmax -= 1
        result.append(crdmax)
    return result
