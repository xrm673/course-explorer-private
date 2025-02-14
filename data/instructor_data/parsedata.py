"""
Author: Raymond Xu
Start Date: February 13, 2025
"""

import pandas as pd
import json
from nameparser import HumanName

df = pd.read_csv('rmp_data.csv')
with open("instructor_name_data.json", 'r') as file:
    data = json.load(file)


def parse_name(full_name):
    name = HumanName(full_name)
    return pd.Series([name.first, name.middle, name.last])

def create_columns(df):
    df[['firstname','middlename','lastname']] = df["Professor_Name"].apply(parse_name)
    return df

def generate_namedf(data):
    result = []
    for subject in data:
        semester = subject[-4:]
        for course in data[subject]:
            for group in data[subject][course]:
                for section in data[subject][course][group]:
                    for instr_dict in data[subject][course][group][section]:
                        result.append(instr_dict)
    name_df = pd.DataFrame(result)
    name_df = name_df.rename(columns={"firstName": "firstname", "lastName": "lastname","middleName":"middlename"})
    name_df = name_df.drop(columns=["instrAssignSeq"])
    return name_df

def generate(name_df,df):
    df = df.merge(name_df, on=["firstname", "middlename", "lastname"], how="left")
    temp_name_df = name_df.drop(columns=["middlename"]).rename(columns={"firstname": "fname", "lastname": "lname", "netid": "netid_temp"})
    df = df.merge(temp_name_df, left_on=["firstname", "lastname"], right_on=["fname", "lname"], how="left")
    df["netid"] = df["netid"].fillna(df["netid_temp"])
    df = df.drop(columns=["netid_temp", "fname", "lname","firstname","lastname","middlename"])
    df = df.drop_duplicates(subset=['netid'], keep='first')
    df = df.where(pd.notna(df), None)
    data_dict = df.set_index("netid").to_dict(orient="index")
    with open("instructor_rate.json", "w") as f:
        json.dump(data_dict, f, indent=4)

df = create_columns(df)
name_df = generate_namedf(data)
generate(name_df,df)



