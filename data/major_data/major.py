import os
import sys
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from service import *

if not firebase_admin._apps:
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
    key_path = os.path.join(base_dir, "secret-keys/serviceAccountKey.json")
    cred = credentials.Certificate(key_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()


def add_major(major_data):
    major_ref = db.collection("majors").document(major_data["id"])
    major_ref.set(major_data)
    print(f"Added major: {major_data['id']}")


def add_requirement(req_data):
    req_ref = db.collection("requirements").document(req_data["id"])
    req_ref.set(req_data)
    print(f"Added requirement: {req_data['id']}")


def commit_ARTH():
    major = {
        "id": "ARTH",
        "name": "History of Art",
        "colleges": [{"id": "CAS", "name": "Arts and Sciences"}],
        "requiredCourses": 10,
        "basicRequirements": [
            {
                "college": "CAS",
                "requirements": [
                    "ARTH_req1",
                    "ARTH_req2",
                    "ARTH_req3",
                    "ARTH_req4",
                    "ARTH_req5",
                ],
            }
        ],
        "init": ["ARTH1100", "ARTH2000"],
    }
    add_major(major)

    req1 = {
        "id": "ARTH_req1",
        "type": "C",
        "name": "Core Courses",
        "tag": "ARTH Core",
        "tagDescr": "This is a core course of Art History major",
        "descr": None,
        "number": 3,
        "courseGrps": [
            {"id": 1, "courses": ["ARTH1100"]},
            {"id": 2, "courses": ["ARTH2000"]},
            {"id": 3, "courses": ["ARTH4101"]},
        ],
    }
    add_requirement(req1)

    req2_courses = get_courses_by_subject_level("ARTH", 2, excluded=["ARTH2000"])
    req2 = {
        "id": "ARTH_req2",
        "type": "E",
        "name": "2000 Level",
        "tag": "2000 ARTH",
        "tagDescr": "This is a 2000 level Art History course.",
        "descr": None,
        "number": 1,
        "courses": req2_courses,
    }
    add_requirement(req2)

    req3_courses = get_courses_by_subject_level("ARTH", 3)
    req3 = {
        "id": "ARTH_req3",
        "type": "E",
        "name": "3000 Level",
        "tag": "3000 ARTH",
        "tagDescr": "This is a 3000 level Art History course.",
        "descr": None,
        "number": 1,
        "courses": req3_courses,
    }
    add_requirement(req3)

    req4_courses = get_courses_by_subject_level("ARTH", 4, excluded=["ARTH4101"])
    req4 = {
        "id": "ARTH_req4",
        "type": "E",
        "name": "4000 Level",
        "tag": "4000 ARTH",
        "tagDescr": "This is a 4000 level Art History course.",
        "descr": None,
        "number": 2,
        "courses": req4_courses,
    }
    add_requirement(req4)

    req5_courses = get_courses_by_subject_min_level(
        "ARTH", 3, excluded=["ARTH2000", "ARTH4101"]
    )
    req5 = {
        "id": "ARTH_req5",
        "type": "E",
        "name": "Electives",
        "tag": "ARTH Electives",
        "tagDescr": "This can be counted as an elective for Art History major.",
        "descr": None,
        "number": 3,
        "courses": req5_courses,
    }
    add_requirement(req5)


def commit_INFO():
    major = {
        "id": "INFO",
        "name": "Information Science",
        "colleges": [
            {"id": "CAS", "name": "Arts and Sciences"},
            {"id": "CALS", "name": "Cornell CALS"},
        ],
        "requiredCourses": 15,
        "basicRequirements": [
            {
                "college": "CAS",
                "requirements": [
                    "INFO_req1",
                    "INFO_req3",
                    "INFO_req4",
                    "INFO_req5",
                    "INFO_req6",
                ],
            },
            {
                "college": "CALS",
                "requirements": [
                    "INFO_req1",
                    "INFO_req3",
                    "INFO_req4",
                    "INFO_req5",
                    "INFO_req6",
                ],
            },
        ],
        "concentrations": [
            {
                "concentration": "Behavioral Science",
                "requirements": ["INFO_req7", "INFO_req8", "INFO_req9"],
            },
            {
                "concentration": "Data Science",
                "requirements": [
                    "INFO_req12",
                    "INFO_req13",
                    "INFO_req14",
                    "INFO_req15",
                ],
            },
        ],
        "init": [
            "INFO1200",
            "INFO1260",
            "INFO1300",
            "CS1110",
            "MATH1110",
            "INFO2040",
            "INFO2450",
            "INFO2950",
            "INFO2951",
            "INFO2300",
            "INFO2310",
        ],
    }
    add_major(major)

    req1 = {
        "id": "INFO_req1",
        "type": "C",
        "name": "Core Courses",
        "tag": "INFO Core",
        "tagDescr": "This is a core course of Information Science major",
        "descr": None,
        "number": 5,
        "courseGrps": [
            {"id": 1, "courses": ["INFO1200", "INFO1260"]},
            {"id": 2, "courses": ["INFO1300"]},
            {"id": 3, "courses": ["INFO2040"]},
            {"id": 4, "courses": ["INFO2450"]},
            {"id": 5, "courses": ["INFO2950", "INFO2951"]},
        ],
        "parallel": [
            {
                "category": "concentration",
                "condition": "Other Concentrations",
                "reqId": "INFO_req1",
            },
            {
                "category": "concentration",
                "condition": "Data Science",
                "reqId": "INFO_req2",
            },
        ],
        "note": "Data Science (DS) concentrators should take INFO 2950 during the fall semester, if possible. Otherwise, DS concentrators should plan to build upon their Python programming skills in preparation for upper-level DS courses.",
    }
    add_requirement(req1)

    # This is the core requirement for Data Science concentration (no INFO2951)
    req2 = {
        "id": "INFO_req2",
        "type": "C",
        "name": "Core Courses (Data Science)",
        "tag": "INFO Core",
        "tagDescr": "This is a core course of Information Science major",
        "descr": None,
        "number": 5,
        "courseGrps": [
            {"id": 1, "courses": ["INFO1200", "INFO1260"]},
            {"id": 2, "courses": ["INFO1300"]},
            {"id": 3, "courses": ["INFO2040"]},
            {"id": 4, "courses": ["INFO2450"]},
            {"id": 5, "courses": ["INFO2950"]},
        ],
        "parallel": [
            {
                "category": "concentration",
                "condition": "Other Concentrations",
                "reqId": "INFO_req1",
            },
            {
                "category": "concentration",
                "condition": "Data Science",
                "reqId": "INFO_req2",
            },
        ],
    }
    add_requirement(req2)

    req3 = {
        "id": "INFO_req3",
        "type": "C",
        "name": "Programming Requirement",
        "tag": "INFO Programming",
        "tagDescr": "This can be counted as a programming course for Information Science major",
        "descr": None,
        "number": 1,
        "courseGrps": [{"id": 1, "courses": ["CS1110", "CS1112"]}],
    }
    add_requirement(req3)

    req4 = {
        "id": "INFO_req4",
        "type": "C",
        "name": "Math Requirement",
        "tag": "INFO Math",
        "tagDescr": "This can be counted as a math course for Information Science major",
        "descr": None,
        "number": 1,
        "courseGrps": [{"id": 1, "courses": ["MATH1106", "MATH1110", "MATH1910"]}],
    }
    add_requirement(req4)

    req5 = {
        "id": "INFO_req5",
        "type": "E",
        "name": "Statistics Requirement",
        "tag": "INFO Stats",
        "tagDescr": "This can be counted as a statistic course for Information Science major",
        "descr": None,
        "number": 1,
        "courses": [
            "AEM2100",
            "BTRY3010",
            "CEE3040",
            "ECON3110",
            "ECON3130",
            "ENGRD2700",
            "ILRST2100",
            "MATH1710",
            "PSYCH2500",
            "PUBPOL2100",
            "SOC3010",
            "STSCI2100",
            "STSCI2150",
            "STSCI2200",
        ],
    }
    add_requirement(req5)

    req6_courses = get_courses_by_subject_min_level(
        "INFO",
        3,
        excluded=["INFO4998", "INFO4910", "INFO5900"],
        included=["INFO2300", "INFO2310", "CS2110", "CS2112", "CS3110", "CS3410"],
    )
    req6 = {
        "id": "INFO_req6",
        "type": "E",
        "name": "Electives",
        "tag": "INFO Electives",
        "tagDescr": "This can be counted as an elective for Information Science major",
        "descr": None,
        "number": 3,
        "courses": req6_courses,
    }
    add_requirement(req6)

    req7 = {
        "id": "INFO_req7",
        "type": "E",
        "name": "Understanding Social Behavior",
        "tag": "INFO Social Behavior",
        "tagDescr": "This can be counted as a Social Behavior course for the Behavioral Science concentration in Information Science major.",
        "descr": None,
        "number": 2,
        "courses": [
            "INFO3460",
            "INFO4430",
            "INFO4450",
            "INFO4490",
            "INFO4500",
            "INFO4505",
            "INFO4800",
            "INFO4940",
            "COMM4380",
            "PSYCH3800",
        ],
    }
    add_requirement(req7)

    req8 = {
        "id": "INFO_req8",
        "type": "E",
        "name": "Social Data Analytics",
        "tag": "INFO Behavioral Data",
        "tagDescr": "This can be counted as a Social Data Analytics course for the Behavioral Science concentration in Information Science major.",
        "descr": None,
        "number": 1,
        "courses": [
            "INFO3300",
            "INFO3950",
            "INFO4100",
            "INFO4300",
            "INFO4350",
            "INFO4940",
            "COMM4242",
            "CS4740",
            "CS3780",
        ],
    }
    add_requirement(req8)

    req9 = {
        "id": "INFO_req9",
        "type": "E",
        "name": "Behavior in Sociological Context",
        "tag": "INFO Sociological Behavior",
        "tagDescr": "This can be counted as a Behavior in Sociological Context course for the Behavioral Science concentration in Information Science major.",
        "descr": None,
        "number": 1,
        "courses": [
            "INFO3200",
            "INFO3561",
            "INFO4650",
            "INFO4940",
            "INFO4940",
            "STS3440",
        ],
        "parallel": [
            {
                "category": "sub-concentration",
                "condition": "Sociological Behavior",
                "reqId": "INFO_req9",
            },
            {
                "category": "sub-concentration",
                "condition": "Network Behavior",
                "reqId": "INFO_req10",
            },
            {
                "category": "sub-concentration",
                "condition": "Behavior in Design",
                "reqId": "INFO_req11",
            },
        ],
    }
    add_requirement(req9)

    req10 = {
        "id": "INFO_req10",
        "type": "E",
        "name": "Behavior in Network Context",
        "tag": "INFO Network Behavior",
        "tagDescr": "This can be counted as a Behavior in Network Context course for the Behavioral Science concentration in Information Science major.",
        "descr": None,
        "number": 1,
        "courses": [
            "INFO4360",
            "COMM4940",
            "SOC3350",
        ],
        "parallel": [
            {
                "category": "sub-concentration",
                "condition": "Sociological Behavior",
                "reqId": "INFO_req9",
            },
            {
                "category": "sub-concentration",
                "condition": "Network Behavior",
                "reqId": "INFO_req10",
            },
            {
                "category": "sub-concentration",
                "condition": "Behavior in Design",
                "reqId": "INFO_req11",
            },
        ],
    }
    add_requirement(req10)

    req11 = {
        "id": "INFO_req11",
        "type": "E",
        "name": "Behavior in Design Context",
        "tag": "INFO Behavior Design",
        "tagDescr": "This can be counted as a Behavior in Design Context course for the Behavioral Science concentration in Information Science major.",
        "descr": None,
        "number": 1,
        "courses": ["INFO3450", "INFO4240", "INFO4400", "INFO4940"],
        "parallel": [
            {
                "category": "sub-concentration",
                "condition": "Sociological Behavior",
                "reqId": "INFO_req9",
            },
            {
                "category": "sub-concentration",
                "condition": "Network Behavior",
                "reqId": "INFO_req10",
            },
            {
                "category": "sub-concentration",
                "condition": "Behavior in Design",
                "reqId": "INFO_req11",
            },
        ],
    }
    add_requirement(req11)

    req12 = {
        "id": "INFO_req12",
        "type": "E",
        "name": "Data Analysis",
        "tag": "INFO Data Analysis",
        "tagDescr": "This can be counted as a Data Analysis course for the Data Science concentration in Information Science major.",
        "descr": None,
        "number": 1,
        "courses": [
            "INFO3300",
            "INFO3900",
            "INFO3950",
            "INFO4940",
            "CS3780",
            "CS4786",
            "ORIE3120",
            "ORIE4740",
            "ORIE3741",
            "STSCI3740",
        ],
    }
    add_requirement(req12)

    req13 = {
        "id": "INFO_req13",
        "type": "E",
        "name": "Domain Expertise",
        "tag": "INFO Data Domain",
        "tagDescr": "This can be counted as a Domain Expertise course for the Data Science concentration in Information Science major.",
        "descr": None,
        "number": 1,
        "courses": [
            "INFO2770",
            "INFO3350",
            "INFO3370",
            "INFO4100",
            "INFO4120",
            "INFO4300",
            "INFO4350",
            "INFO4940",
            "CS4740",
            "PUBPOL2130",
        ],
    }
    add_requirement(req13)

    req14 = {
        "id": "INFO_req14",
        "type": "E",
        "name": "Big Data Ethics, Policy and Society",
        "tag": "INFO Data Ethics",
        "tagDescr": "This can be counted as a Big Data Ethics, Policy and Society course for the Data Science concentration in Information Science major.",
        "descr": None,
        "number": 1,
        "courses": [
            "INFO3200",
            "INFO3561",
            "INFO4145",
            "INFO4200",
            "INFO4240",
            "INFO4250",
            "INFO4260",
            "INFO4270",
            "INFO4390",
            "INFO4561",
            "INFO4940",
            "COMM4242",
            "ENGL3778",
            "PUBPOL3460",
            "STS3440",
        ],
    }
    add_requirement(req14)

    req15 = {
        "id": "INFO_req15",
        "type": "E",
        "name": "Data Communication",
        "tag": "INFO Data Communication",
        "tagDescr": "This can be counted as a Data Communication course for the Data Science concentration in Information Science major.",
        "descr": None,
        "number": 1,
        "courses": [
            "INFO3312",
            "INFO4310",
            "COMM3150",
            "COMM3189",
            "COMM4200",
            "COMM4860",
            "COMM4940",
            "GOVT2169",
            "SOC3580",
        ],
    }
    add_requirement(req15)


if __name__ == "__main__":
    commit_ARTH()
    commit_INFO()
