"""
Author: Raymond Xu
Date: February 13, 2025
"""

class Instructor(object):
    def get_quality(self):
        if self._data:
            return self._data["Quality"]
        return None

    def __init__(self,netid,name,instructor_data):
        self._netid = netid 
        self._name = name
        if netid in instructor_data:
            self._data = instructor_data[netid]
        else:
            self._data = None
    
    def __str__(self):
        return self._name