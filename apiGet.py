"""
Author: Raymond Xu
Start Date: February 8, 2025
"""

import requests

def api_get_subjects(semester):
    api = "https://classes.cornell.edu/api/2.0/config/subjects.json?roster=" + semester
    response = requests.get(api)
    if response.status_code == 200:
        data = response.json()
        return data
    elif response.status_code == 404:
        print(f"{semester} page not found")
    else:
        raise Exception(f"Error: {response.status_code}")


def get(semester,subject,career=None,level=None):
    """
    return the obtained api
    """
    api = (f"https://classes.cornell.edu/api/2.0/search/"
           f"classes.json?roster={semester}&subject={subject}")
      
    if career:
        api = api + "&acadCareer[]=" + career 
    
    if level:
        api = api + "&classLevels[]=" + level 
    
    response = requests.get(api)
    if response.status_code == 200:
        data = response.json()
        return data
    elif response.status_code == 404:
        print(f"{semester}-{subject} page not found!")
    else:
        raise Exception(f"Error: {response.status_code}")
