"""
Author: Raymond Xu
Start Date: February 13, 2025
"""

import pandas as pd
import json
from nameparser import HumanName
import duckdb

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
        for course in data[subject]:
            for group in data[subject][course]:
                for section in data[subject][course][group]:
                    for instr_dict in data[subject][course][group][section]:
                        # make_correction(instr_dict)
                        if instr_dict["middleName"]:
                            instr_dict["Professor_Name"] = (f"{instr_dict['firstName']} "
                                                    f"{instr_dict['middleName']} "
                                                    f"{instr_dict['lastName']}")
                        else:
                            instr_dict["Professor_Name"] = (f"{instr_dict['firstName']} "
                                                    f"{instr_dict['lastName']}")
                        result.append(instr_dict)
    name_df = pd.DataFrame(result)
    name_df = name_df.rename(columns={"firstName": "firstname", "lastName": "lastname","middleName":"middlename"})
    name_df = name_df.drop(columns=["instrAssignSeq"])
    return name_df

def generate(name_df,df):

    # Step 1️⃣: Merge on Full Professor Name (Most Precise Match)
    df1 = df.merge(name_df, on="Professor_Name", how="left")
    df1 = df1[df1["netid"].notna()]  # Keep only rows with netid

    # Step 2️⃣: Merge on Firstname + Middlename + Lastname
    df2 = df.merge(name_df, on=["firstname", "middlename", "lastname"], how="left")
    df2 = df2[df2["netid"].notna()]  # Keep only rows with netid

    # Step 3️⃣: Merge on Firstname + Lastname (Ignoring Middlename)
    temp_name_df = name_df.drop(columns=["middlename"])
    df3 = df.merge(temp_name_df, left_on=["firstname", "lastname"], right_on=["firstname", "lastname"], how="left")
    df3 = df3[df3["netid"].notna()]  # Keep only rows with netid

    # Step 4️⃣: Concatenate All DataFrames Together
    df_final = pd.concat([df1, df2, df3])

    # Step 5️⃣: Drop Duplicate `netid` Entries (Keeping First Valid Match)
    df_final = df_final.drop_duplicates(subset=["netid"], keep="first")

    # Step 6️⃣: Drop Unnecessary Columns
    df_final = df_final.drop(columns=["firstname", "lastname", "middlename",
                                      "firstname_x","middlename_x","lastname_x",
                                      "firstname_y","middlename_y","lastname_y"], errors="ignore")

    df = df_final.where(pd.notna(df_final), None)
    data_dict = df.set_index("netid").to_dict(orient="index")
    for netid in data_dict:
        if not data_dict[netid]["Professor_Name"]:
            if data_dict[netid]["Professor_Name_x"]:
                data_dict[netid]["Professor_Name"] = data_dict[netid]["Professor_Name_x"]
            elif data_dict[netid]["Professor_Name_y"]: 
                data_dict[netid]["Professor_Name"] = data_dict[netid]["Professor_Name_y"]

    with open("instructor_rate.json", "w") as f:
        json.dump(data_dict, f, indent=4)  

df = create_columns(df)
name_df = generate_namedf(data)
generate(name_df,df)



