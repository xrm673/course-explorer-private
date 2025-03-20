import sys
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

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


def get_rate_by_subject(sbj, driver):
    id_list = get_courses_by_subject(sbj)
    result = []
    for id in id_list:
        nbr = id[-4:]
        url = f"https://www.cureviews.org/course/{sbj}/{nbr}"
        try:
            driver.get(url)
            WebDriverWait(driver, 1.5).until(
                EC.presence_of_element_located(
                    (By.CSS_SELECTOR, "[class*='_overallScore']")
                )
            )
            score_elements = driver.find_elements(
                By.CSS_SELECTOR, "[class*='_overallScore']"
            )
            overall_score = score_elements[0].text
            if overall_score and overall_score != "--":
                try:
                    overall_score = float(overall_score)
                except ValueError:
                    print(
                        f"Warning: Couldn't convert score '{overall_score}' to float for {id}"
                    )
            else:
                overall_score = None
            result.append({id: overall_score})
        except Exception as e:
            print(f"{id} has an error")
            continue
    return result


def update_course_ratings(subject, driver):
    # Get ratings for all courses in the subject
    ratings_data = get_rate_by_subject(subject, driver)

    # Reference to Firestore courses collection
    courses_ref = db.collection("courses")

    # Counter for successful updates
    update_count = 0

    # Loop through each course rating
    for rating_item in ratings_data:
        for course_id, score in rating_item.items():
            try:
                # Get reference to the specific course document
                course_doc_ref = courses_ref.document(course_id)

                # Update the document with the rating
                course_doc_ref.update(
                    {"ov": score}  # You can change this field name if desired
                )

                print(f"Successfully updated rating for {course_id}: {score}")
                update_count += 1

            except Exception as e:
                print(f"Error updating {course_id} in database: {e}")

    print(
        f"Updated {update_count} out of {len(ratings_data)} courses for subject {subject}"
    )
    return update_count


if __name__ == "__main__":
    driver = webdriver.Chrome()
    # update_course_ratings("INFO", driver)
    # update_course_ratings("CS", driver)
    # update_course_ratings("ARTH", driver)
    # update_course_ratings("COMM", driver)
    # update_course_ratings("STSCI", driver)
    # update_course_ratings("MATH", driver)
    # update_course_ratings("PSYCH", driver)
    # update_course_ratings("PUBPOL", driver)
    # update_course_ratings("ORIE", driver)
    update_course_ratings("ECON", driver)
    update_course_ratings("ILRST", driver)
    update_course_ratings("CEE", driver)
    update_course_ratings("SOC", driver)
    update_course_ratings("BTRY", driver)
    update_course_ratings("ENGRD", driver)
    update_course_ratings("PHYS", driver)
    update_course_ratings("MSE", driver)
    update_course_ratings("AEP", driver)
    driver.quit()
