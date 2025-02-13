"""
Author: Raymond Xu
Date: February 12, 2025
"""

import app 
from constants import *
import os 
import json
import course 
import time 

def load_data():
    load_course_data()
    load_college_data()

def load_course_data():
    global course_data_am
    global course_data_nz
    global SP_session
    global FA_session
    global WI_session
    global SU_session
    
    filepath = os.path.join(COURSE_DATA_ROUTE,"combined_am.json")
    with open(filepath, 'r') as file:
        course_data_am = json.load(file)
    
    filepath = os.path.join(COURSE_DATA_ROUTE,"combined_nz.json")
    with open(filepath,'r') as file:
        course_data_nz = json.load(file)
    
    filepath = os.path.join(SESSION_DATA_ROUTE,"SP_session.json")
    with open(filepath,'r') as file:
        SP_session = json.load(file)
    
    filepath = os.path.join(SESSION_DATA_ROUTE,"FA_session.json")
    with open(filepath,'r') as file:
        FA_session = json.load(file)
    
    filepath = os.path.join(SESSION_DATA_ROUTE,"SU_session.json")
    with open(filepath,'r') as file:
        SU_session = json.load(file)
    
    filepath = os.path.join(SESSION_DATA_ROUTE,"WI_session.json")
    with open(filepath,'r') as file:
        WI_session = json.load(file)

def load_college_data():
    global college_data
    with open('data/college_data/college.json', 'r') as file:
        college_data = json.load(file)

def test_get_credits(course_data_am,course_data_nz,
                     FA_session,SP_session,SU_session,WI_session):
    
    cs1110 = course.Course.create("CS1110",course_data_am,
                                  FA_session,SP_session,SU_session,WI_session)
    return cs1110.get_credits()

if __name__ == "__main__":
    start_time = time.time()
    load_data()
    load_time = time.time()
    count = 0
    while count < 10000:
        test_get_credits(course_data_am,course_data_nz,
                        FA_session,SP_session,SU_session,WI_session)
        count += 1
    end_time = time.time() 
    print(load_time - start_time)
    print(end_time - load_time)
    # 0.1551236