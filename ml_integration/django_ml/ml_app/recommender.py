# courses/recommend.py

import pandas as pd
import re
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document
from dotenv import load_dotenv
import os

load_dotenv()

# Load data
courses = pd.read_csv("ml_app/courses_cleaned.csv")

with open("ml_app/tagged_title.txt", "r", encoding="utf-8") as f:
    lines = [line.strip() for line in f if line.strip()]
documents = [Document(page_content=line) for line in lines]

embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2", model_kwargs={"device": "cpu"})
db_courses = Chroma.from_documents(documents=documents, embedding=embedding_model, persist_directory="ml_app/chroma_db")

category_mapping = {
    'Web Development': "Computer Science",
    'Business Finance': "Other",
    'Graphic Design': "Computer Science",
    'Musical Instruments': "Other"
}

if "subject" in courses.columns:
    courses["category"] = courses["subject"].map(category_mapping)

def extract_course_id(content):
    match = re.search(r'\d+', content)
    return int(match.group()) if match else None

def retrieve_semantic_recommendations(query: str, category: str = "ALL", initial_top_k: int = 50, final_top_k: int = 16) -> pd.DataFrame:
    recs = db_courses.similarity_search(query, k=initial_top_k)
    course_ids = [extract_course_id(doc.page_content) for doc in recs if extract_course_id(doc.page_content)]
    courses_recs = courses[courses["course_id"].isin(course_ids)]
    if category != "ALL" and "category" in courses.columns:
        courses_recs = courses_recs[courses_recs["category"] == category]
    return courses_recs.head(final_top_k)

def recommend_courses(query: str, category: str = "ALL") -> list:
    recommendations = retrieve_semantic_recommendations(query, category)
    results = []
    for _, row in recommendations.iterrows():
        title = row["course_title"]
        course_url = row["url"]
        results.append({"title": title, "url": course_url})
    return results


