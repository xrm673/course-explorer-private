"""
Author: Raymond Xu
Start Date: February 13, 2025
"""

class Group(object):
    def get_credits(self):
        return self._data["crd"]
    
    def get_section_requirement(self):
        return self._data["req"]

    def __init__(self,course_code,group_code,group_data):
        self._coursecode = course_code 
        self._groupcode = group_code 
        self._data = group_data
        self._sections = []
        for attribute in group_data:
            if len(attribute) == 7:
                pass

