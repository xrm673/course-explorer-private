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
        "init": [
            "ARTH1100",
            "ARTH2000",
            "ARTH1178",
            "ARTH1154",
            "ARTH2750",
            "ARTH4101",
        ],
    }
    add_major(major)

    req1 = {
        "id": "ARTH_req1",
        "type": "C",
        "major": "ARTH",
        "name": "Core Courses",
        "tag": "ARTH Core",
        "tagDescr": "This is a core course of Art History major",
        "descr": [
            "The History of Art major requires the completion of all three courses listed below.",
            "Students must receive a grade of B or higher in ARTH 1100.",
            "If students have not taken ARTH 1100 by the spring of sophomore year, they must complete a 4000-level tutorial course and receive a grade of B or higher in order to qualify for the major.",
            "A grade of B- or higher is required of all other courses to receive credit toward the major.",
        ],
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
        "major": "ARTH",
        "name": "2000 Level",
        "tag": "2000 ARTH",
        "tagDescr": "This is a 2000 level Art History course.",
        "descr": ["Take at least one ARTH course at the 2000-level."],
        "number": 1,
        "courses": req2_courses,
    }
    add_requirement(req2)

    req3_courses = get_courses_by_subject_level("ARTH", 3)
    req3 = {
        "id": "ARTH_req3",
        "type": "E",
        "major": "ARTH",
        "name": "3000 Level",
        "tag": "3000 ARTH",
        "tagDescr": "This is a 3000 level Art History course.",
        "descr": ["Take at least one ARTH course at the 3000-level."],
        "number": 1,
        "courses": req3_courses,
    }
    add_requirement(req3)

    req4_courses = get_courses_by_subject_level("ARTH", 4, excluded=["ARTH4101"])
    req4 = {
        "id": "ARTH_req4",
        "type": "E",
        "major": "ARTH",
        "name": "4000 Level",
        "tag": "4000 ARTH",
        "tagDescr": "This is a 4000 level Art History course.",
        "descr": ["Take at least one ARTH course at the 4000-level."],
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
        "major": "ARTH",
        "name": "Electives",
        "tag": "ARTH Electives",
        "tagDescr": "This can be counted as an elective for Art History major.",
        "descr": ["Take three additional ARTH electives at the 3000-level or higher."],
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
                    "INFO_req2",
                    "INFO_req3",
                    "INFO_req4",
                    "INFO_req5",
                ],
            },
            {
                "college": "CALS",
                "requirements": [
                    "INFO_req1",
                    "INFO_req2",
                    "INFO_req3",
                    "INFO_req4",
                    "INFO_req5",
                ],
            },
        ],
        "concentrations": [
            {
                "concentration": "Behavioral Science",
                "requirements": ["INFO_req6", "INFO_req7", "INFO_req8"],
            },
            {
                "concentration": "Data Science",
                "requirements": [
                    "INFO_req11",
                    "INFO_req12",
                    "INFO_req13",
                    "INFO_req14",
                ],
            },
            {
                "concentration": "Digital Culture and Production",
                "requirements": ["INFO_req15", "INFO_req16", "INFO_req17"],
            },
            {
                "concentration": "Information Ethics, Law, and Policy",
                "requirements": [
                    "INFO_req18",
                    "INFO_req19",
                    "INFO_req20",
                    "INFO_req21",
                ],
            },
            {
                "concentration": "Interactive Technology",
                "requirements": [
                    "INFO_req22",
                    "INFO_req23",
                    "INFO_req24",
                    "INFO_req25",
                ],
            },
            {
                "concentration": "UX Design",
                "requirements": [
                    "INFO_req26",
                    "INFO_req27",
                    "INFO_req28",
                    "INFO_req29",
                ],
            },
        ],
        "init": [
            "INFO1200",
            "INFO1260",
            "INFO1300",
            "INFO1998",
            "CS1110",
            "MATH1110",
            "INFO2040",
            "INFO2450",
            "INFO2950",
            "INFO2951",
        ],
    }
    add_major(major)

    req1 = {
        "id": "INFO_req1",
        "type": "C",
        "major": "INFO",
        "name": "Core Courses",
        "tag": "INFO Core",
        "tagDescr": "This is a core course of Information Science major",
        "descr": [
            "Information Science students must take at lease one course from each of the course group listed below.",
        ],
        "Note": "Data Science (DS) concentrators should take INFO 2950: Introduction to Data"
        " Science with Python during the fall semester, if possible. Otherwise, "
        "DS concentrators should plan to build upon their Python programming skills in preparation "
        "for upper-level DS courses.",
        "number": 5,
        "courseGrps": [
            {"id": 1, "courses": ["INFO1200", "INFO1260"]},
            {"id": 2, "courses": ["INFO1300"]},
            {"id": 3, "courses": ["INFO2040"]},
            {"id": 4, "courses": ["INFO2450"]},
            {"id": 5, "courses": ["INFO2950", "INFO2951"]},
        ],
        "note": "Data Science (DS) concentrators should take INFO 2950 during the fall semester, if possible. Otherwise, DS concentrators should plan to build upon their Python programming skills in preparation for upper-level DS courses.",
    }
    add_requirement(req1)

    req2 = {
        "id": "INFO_req2",
        "type": "C",
        "major": "INFO",
        "name": "Programming Requirement",
        "tag": "INFO Programming",
        "tagDescr": "This can be counted as a programming course for Information Science major",
        "descr": [
            "Take CS 1110 or CS 1112 for letter grade to fulfill the programming requirement."
        ],
        "number": 1,
        "courseGrps": [{"id": 1, "courses": ["CS1110", "CS1112"]}],
    }
    add_requirement(req2)

    req3 = {
        "id": "INFO_req3",
        "type": "E",
        "major": "INFO",
        "name": "Math Requirement",
        "tag": "INFO Math",
        "tagDescr": "This can be counted as a math course for Information Science major",
        "descr": [
            "Take a Calculus I course (MATH 1106, MATH 1110, or MATH 1910) for letter grade to fulfill the math requirement. ",
            "AP credits can fulfill this requirement.",
        ],
        "number": 1,
        "courses": ["MATH1106", "MATH1110", "MATH1910"],
    }
    add_requirement(req3)

    req4 = {
        "id": "INFO_req4",
        "type": "E",
        "major": "INFO",
        "name": "Statistics Requirement",
        "tag": "INFO Stats",
        "tagDescr": "This can be counted as a statistic course for Information Science major",
        "descr": [
            "Take one of the statistics courses provided below. ",
            "AP credits may NOT be used to fulfill this requirement.",
        ],
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
    add_requirement(req4)

    req5_courses = get_courses_by_subject_min_level(
        "INFO",
        3,
        excluded=["INFO4998", "INFO4910", "INFO5900"],
        included=["INFO2300", "INFO2310", "CS2110", "CS2112", "CS3110", "CS3410"],
    )
    req5 = {
        "id": "INFO_req5",
        "type": "E",
        "major": "INFO",
        "name": "Electives",
        "tag": "INFO Electives",
        "tagDescr": "This can be counted as an elective for Information Science major",
        "descr": [
            "Complete three electives from any INFO 3000+ course (including INFO 4900 but excluding INFO 4998 and INFO 4910).",
            "INFO 2300/2310 (one of them), CS 2110/2112, CS 3110, and CS 3410 may also be counted.",
            "Up to two courses from qualifying study abroad programs may be transfered to Cornell and applied as major "
            "elective credit. Please review the Study Abroad guidelines for details. ",
            "Electives must be taken for a letter grade, each must earn three or more credit hours, and "
            "must be completed with a grade of C- or higher (a grade of C or higher is required for "
            "courses taken abroad).",
            "Students may only fulfill one of their electives with INFO 4900.",
        ],
        "number": 3,
        "courses": req5_courses,
    }
    add_requirement(req5)

    req6 = {
        "id": "INFO_req6",
        "type": "E",
        "major": "INFO",
        "name": "Understanding Social Behavior",
        "tag": "Social Behavior",
        "tagDescr": "This can be counted as a Social Behavior course for the Behavioral Science concentration in Information Science major.",
        "descr": ["Take two of the courses listed below."],
        "number": 2,
        "courses": [
            "INFO3460",
            "INFO4430",
            "INFO4450",
            "INFO4490",
            "INFO4500",
            "INFO4505",
            "INFO4800",
            "COMM4380",
            "PSYCH3800",
        ],
    }
    add_requirement(req6)

    req7 = {
        "id": "INFO_req7",
        "type": "E",
        "major": "INFO",
        "name": "Social Data Analytics",
        "tag": "Behavioral Data",
        "tagDescr": "This can be counted as a Social Data Analytics course for the Behavioral Science concentration in Information Science major.",
        "descr": [
            "Take one of the courses listed below",
        ],
        "number": 1,
        "courses": [
            "INFO3300",
            "INFO3950",
            "INFO4100",
            "INFO4300",
            "INFO4350",
            "COMM4242",
            "CS4740",
            "CS3780",
        ],
    }
    add_requirement(req7)

    req8 = {
        "id": "INFO_req8",
        "type": "E",
        "major": "INFO",
        "name": "Behavior in Sociological Context",
        "tag": "Sociological Behavior",
        "tagDescr": "This can be counted as a Behavior in Sociological Context course for the Behavioral Science concentration in Information Science major.",
        "descr": [
            "Take one of the courses listed below.",
        ],
        "number": 1,
        "courses": [
            "INFO3200",
            "INFO3561",
            "INFO4650",
            "STS3440",
        ],
        "parallel": [
            {
                "category": "sub-concentration",
                "condition": "Sociological Behavior",
                "reqId": "INFO_req8",
            },
            {
                "category": "sub-concentration",
                "condition": "Network Behavior",
                "reqId": "INFO_req9",
            },
            {
                "category": "sub-concentration",
                "condition": "Behavior in Design",
                "reqId": "INFO_req10",
            },
        ],
    }
    add_requirement(req8)

    req9 = {
        "id": "INFO_req9",
        "type": "E",
        "major": "INFO",
        "name": "Behavior in Network Context",
        "tag": "Network Behavior",
        "tagDescr": "This can be counted as a Behavior in Network Context course for the Behavioral Science concentration in Information Science major.",
        "descr": [
            "Take one of the courses listed below.",
        ],
        "number": 1,
        "courses": [
            "INFO4360",
            "SOC3350",
        ],
        "parallel": [
            {
                "category": "sub-concentration",
                "condition": "Sociological Behavior",
                "reqId": "INFO_req8",
            },
            {
                "category": "sub-concentration",
                "condition": "Network Behavior",
                "reqId": "INFO_req9",
            },
            {
                "category": "sub-concentration",
                "condition": "Behavior in Design",
                "reqId": "INFO_req10",
            },
        ],
    }
    add_requirement(req9)

    req10 = {
        "id": "INFO_req10",
        "type": "E",
        "major": "INFO",
        "name": "Behavior in Design Context",
        "tag": "Behavior in Design",
        "tagDescr": "This can be counted as a Behavior in Design Context course for the Behavioral Science concentration in Information Science major.",
        "descr": ["Take one of the courses listed below."],
        "number": 1,
        "courses": ["INFO3450", "INFO4240", "INFO4400"],
        "parallel": [
            {
                "category": "sub-concentration",
                "condition": "Sociological Behavior",
                "reqId": "INFO_req8",
            },
            {
                "category": "sub-concentration",
                "condition": "Network Behavior",
                "reqId": "INFO_req9",
            },
            {
                "category": "sub-concentration",
                "condition": "Behavior in Design",
                "reqId": "INFO_req10",
            },
        ],
    }
    add_requirement(req10)

    req11 = {
        "id": "INFO_req11",
        "type": "E",
        "major": "INFO",
        "name": "Data Analysis",
        "tag": "Data Analysis",
        "tagDescr": "This can be counted as a Data Analysis course for the Data Science concentration in Information Science major.",
        "descr": [
            "Consists of advanced courses in machine learning, data mining, and analytics across departments.",
            "Take one of the courses listed below.",
        ],
        "number": 1,
        "courses": [
            "INFO3300",
            "INFO3900",
            "INFO3950",
            "CS3780",
            "CS4786",
            "ORIE3120",
            "ORIE4740",
            "ORIE3741",
            "STSCI3740",
        ],
    }
    add_requirement(req11)

    req12 = {
        "id": "INFO_req12",
        "type": "E",
        "major": "INFO",
        "name": "Domain Expertise",
        "tag": "Data Domain",
        "tagDescr": "This can be counted as a Domain Expertise course for the Data Science concentration in Information Science major.",
        "descr": [
            "Features specialized courses applying data science across diverse fields including sustainability, language processing, and social science.",
            "Take one of the courses listed below.",
        ],
        "number": 1,
        "courses": [
            "INFO2770",
            "INFO3350",
            "INFO3370",
            "INFO4100",
            "INFO4120",
            "INFO4300",
            "INFO4350",
            "CS4740",
            "PUBPOL2130",
        ],
    }
    add_requirement(req12)

    req13 = {
        "id": "INFO_req13",
        "type": "E",
        "major": "INFO",
        "name": "Big Data Ethics, Policy and Society",
        "tag": "Data Ethics",
        "tagDescr": "This can be counted as a Big Data Ethics, Policy and Society course for the Data Science concentration in Information Science major.",
        "descr": [
            "Includes courses examining the social, ethical, legal, and policy implications of data science and technology.",
            "Take one of the courses listed below.",
        ],
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
            "COMM4242",
            "ENGL3778",
            "PUBPOL3460",
            "STS3440",
        ],
    }
    add_requirement(req13)

    req14 = {
        "id": "INFO_req14",
        "type": "E",
        "major": "INFO",
        "name": "Data Communication",
        "tag": "Data Communication",
        "tagDescr": "This can be counted as a Data Communication course for the Data Science concentration in Information Science major.",
        "descr": [
            "Covers courses in data visualization, information communication, and data-oriented research methods.",
            "Take one of the courses listed below.",
        ],
        "number": 1,
        "courses": [
            "INFO3312",
            "INFO4310",
            "COMM3150",
            "COMM3189",
            "COMM4200",
            "COMM4860",
            "GOVT2169",
            "SOC3580",
        ],
    }
    add_requirement(req14)

    req15 = {
        "id": "INFO_req15",
        "type": "E",
        "major": "INFO",
        "name": "Digital Culture and History",
        "tag": "Digital Culture",
        "tagDescr": "This can be counted as a Digital Culture and History course for the Digital Culture and Production concentration in Information Science major.",
        "descr": [
            "You can choose to take 1 course in this section and 2 courses in the Design section."
            "You can also choose to take 3 courses in this section and 0 course in the Design section."
        ],
        "number": 1,
        "courses": [
            "INFO2921",
            "INFO3200",
            "INFO3561",
            "INFO4260",
            "STS3440",
            "STS4040",
        ],
    }
    add_requirement(req15)

    req16 = {
        "id": "INFO_req16",
        "type": "E",
        "major": "INFO",
        "name": "Digital Production",
        "tag": "Digital Production",
        "tagDescr": "This can be counted as a Digital Production course for the Digital Culture and Production concentration in Information Science major.",
        "descr": ["Take one course in this section."],
        "number": 1,
        "courses": [
            "​INFO2300",
            "INFO2310",
            "INFO3152",
            "INFO3300",
            "INFO4320",
            "CS3758",
            "CS4620",
        ],
    }
    add_requirement(req16)

    req17 = {
        "id": "INFO_req17",
        "type": "E",
        "major": "INFO",
        "name": "Media, Art, Design",
        "tag": "Media Design",
        "tagDescr": "This can be counted as a Media, Art, Design course for the Digital Culture and Production concentration in Information Science major.",
        "descr": [
            "Take two courses in this section.",
            "You do not need to take course in this section if you plan to take three courses in the Digital Culture and History section.",
        ],
        "number": 2,
        "courses": [
            "INFO2750",
            "INFO3450",
            "INFO3660",
            "INFO4152",
            "INFO4240",
            "INFO4400",
            "INFO4420",
            "ART3705",
            "ARTH4151",
            "ARTH4154",
            "COML3115",
            "HIST2293",
        ],
    }
    add_requirement(req17)

    req18 = {
        "id": "INFO_req18",
        "type": "E",
        "major": "INFO",
        "name": "Frameworks and Institutions",
        "tag": "Ethics Frameworks",
        "tagDescr": "This can be counted as a Frameworks and Institutions course for the Information Ethics, Law, and Policy concentration in Information Science major.",
        "descr": ["Take one course in this section."],
        "number": 1,
        "courses": [
            "INFO4113",
            "INFO4200",
            "INFO4250",
            "INFO4301",
            "HADM4890",
            "PUBPOL3460",
            "STS2761",
        ],
    }
    add_requirement(req18)

    req19 = {
        "id": "INFO_req19",
        "type": "E",
        "major": "INFO",
        "name": "Methods and Analysis",
        "tag": "Ethics Methods",
        "tagDescr": "This can be counted as a Methods and Analysis course for the Information Ethics, Law, and Policy concentration in Information Science major.",
        "descr": ["Take one course in this section."],
        "number": 1,
        "courses": [
            "INFO2921",
            "INFO4240",
            "INFO4800",
            "COMM4242",
            "CRP3210",
            "PUBPOL2300",
        ],
    }
    add_requirement(req19)

    req20 = {
        "id": "INFO_req20",
        "type": "E",
        "major": "INFO",
        "name": "Cases / Topics",
        "tag": "Ethics Cases",
        "tagDescr": "This can be counted as a Cases / Topics course for the Information Ethics, Law, and Policy concentration in Information Science major.",
        "descr": ["Take one course in this section."],
        "number": 1,
        "courses": [
            "INFO3200",
            "INFO3460",
            "INFO3561",
            "INFO4145",
            "INFO4260",
            "INFO4270",
            "INFO4390",
            "INFO4561",
            "STS3440",
            "STS4040",
        ],
    }
    add_requirement(req20)

    req21 = {
        "id": "INFO_req21",
        "type": "E",
        "major": "INFO",
        "name": "Tools and Technical Domains",
        "tag": "Ethics Tools",
        "tagDescr": "This can be counted as a Tools and Technical Domains course for the Information Ethics, Law, and Policy concentration in Information Science major.",
        "descr": [
            "Take one course in this section.",
            "Students may petition the Director of Undergraduate Studies to allow any upper-level (3000 or above) technical IS course relevant to their work in ELP to satisfy this category.",
        ],
        "number": 1,
        "courses": [
            "INFO3300",
            "INFO3350",
            "INFO3370",
            "INFO4100",
            "INFO4120",
            "INFO4300",
            "INFO4350",
        ],
    }
    add_requirement(req21)

    req22 = {
        "id": "INFO_req22",
        "type": "C",
        "major": "INFO",
        "name": "Required Course",
        "tag": "IT Core",
        "tagDescr": "This is a core course for the Interactive Technologies concentration in Information Science major.",
        "descr": [
            "CS 2110 is a required course for this concentration.",
        ],
        "number": 1,
        "courseGrps": [{"id": 1, "courses": ["CS2110"]}],
    }
    add_requirement(req22)

    req23 = {
        "id": "INFO_req23",
        "type": "E",
        "major": "INFO",
        "name": "Building with Hardware",
        "tag": "IT Hardware",
        "tagDescr": "This can be counted as a Building with Hardware course for the Interactive Technologies concentration in Information Science major.",
        "descr": [
            "Take one of the three courses for this requirement.",
        ],
        "number": 1,
        "courses": ["INFO4120", "INFO4320", "CS4758"],
    }
    add_requirement(req23)

    req24 = {
        "id": "INFO_req24",
        "type": "E",
        "major": "INFO",
        "name": "Working with Data/Software",
        "tag": "IT Software",
        "tagDescr": "This can be counted as a Working with Data/Software course for the Interactive Technologies concentration in Information Science major.",
        "descr": [
            "Take one of the courses for this requirement.",
        ],
        "number": 1,
        "courses": [
            "INFO3300",
            "INFO4340",
            "INFO4555",
            "CS4620",
            "CS3780",
            "CS4786",
            "CS5150",
            "ORIE3120",
            "ORIE4740",
            "ORIE3741",
            "STSCI3740",
        ],
    }
    add_requirement(req24)

    req25 = {
        "id": "INFO_req25",
        "type": "E",
        "major": "INFO",
        "name": "Context/Application Domains",
        "tag": "IT Context",
        "tagDescr": "This can be counted as a Context/Application Domains course for the Interactive Technologies concentration in Information Science major.",
        "descr": [
            "Take one of the courses for this requirement.",
        ],
        "number": 1,
        "courses": [
            "INFO4152",
            "INFO4154",
            "INFO4275",
            "INFO4310",
            "INFO4410",
            "INFO4430",
            "INFO4505",
            "INFO4940",
            "INFO4940",
            "CS4752",
        ],
    }
    add_requirement(req25)

    req26 = {
        "id": "INFO_req26",
        "type": "E",
        "major": "INFO",
        "name": "Core Principles of Design",
        "tag": "UX Principles",
        "tagDescr": "This can be counted as a Core Principle course for the UX Design concentration in Information Science major.",
        "descr": [
            "Take one of the courses for this requirement.",
        ],
        "number": 1,
        "courses": [
            "INFO3450",
            "INFO4400",
            "INFO4410",
        ],
    }
    add_requirement(req26)

    req27 = {
        "id": "INFO_req27",
        "type": "E",
        "major": "INFO",
        "name": "Design in Context",
        "tag": "UX Context",
        "tagDescr": "This can be counted as a Context course for the UX Design concentration in Information Science major.",
        "descr": [
            "Take one of the courses for this requirement.",
        ],
        "number": 1,
        "courses": ["INFO2921", "INFO4240", "INFO4420", "INFO4505"],
    }
    add_requirement(req27)

    req28 = {
        "id": "INFO_req28",
        "type": "E",
        "major": "INFO",
        "name": "Knowing the User",
        "tag": "UX User",
        "tagDescr": "This can be counted as a Knowing the User course for the UX Design concentration in Information Science major.",
        "descr": [
            "Take one of the courses for this requirement.",
        ],
        "number": 1,
        "courses": [
            "INFO3460",
            "INFO4125",
            "INFO4430",
            "INFO4450",
            "INFO4490",
            "COMM4380",
            "PSYCH3420",
        ],
    }
    add_requirement(req28)

    req29 = {
        "id": "INFO_req29",
        "type": "E",
        "major": "INFO",
        "name": "Knowing the Technology",
        "tag": "UX Technology",
        "tagDescr": "This can be counted as a Knowing the Technology course for the UX Design concentration in Information Science major.",
        "descr": [
            "Take one of the courses for this requirement.",
        ],
        "number": 1,
        "courses": [
            "INFO3152",
            "INFO4152",
            "INFO4154",
            "INFO4275",
            "INFO4310",
            "INFO4320",
            "INFO4340",
            "CS5150",
        ],
    }
    add_requirement(req29)


if __name__ == "__main__":
    # commit_ARTH()
    commit_INFO()
