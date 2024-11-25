# CyberScope: Real-Time Insights into Cyber Incidents

This project aims to develop a **web-based platform** that autonomously collects, structures, and presents **cyber incident data** relevant to Indian cyberspace. The platform is designed to support the **National Critical Information Infrastructure Protection Centre (NCIIPC)** by enabling **better threat assessment and response**. The project was developed as part of the Smart India Hackathon (SIH) 2024.

## Introduction

In an era where cyber threats are becoming more sophisticated, it is crucial to develop tools that can **proactively detect, monitor, and respond** to these threats. CyberScope provides a **real-time platform** that aggregates cybersecurity incident data from various sources and presents it in an interactive, digestible format to aid stakeholders in mitigating risks. The project supports NCIIPC's efforts in protecting India's national security by providing valuable cyber threat intelligence.

## Objectives

- **Automated Data Aggregation**: Collect cybersecurity data from diverse sources, such as threat intelligence feeds, public reports, and social media, in real-time.
- **Real-time Analytics and Visualization**: Present the aggregated data using interactive dashboards and visualizations for quick insights and decision-making.

## Features

1. **Web Scraping and Automation**: Uses tools like Selenium, Scrapy, and BeautifulSoup to autonomously collect cyber incident data.
2. **Database Management**: A relational database (MySQL/PostgreSQL) stores structured incident data, including metadata (incident type, source, date, etc.).
3. **Machine Learning**: Implements models using TensorFlow and Scikit-learn to analyze the data and detect patterns or emerging threats.
4. **Interactive Dashboards**: Built with ReactJS, allowing users to explore the data and generate reports.
5. **Scalable Backend**: Developed using NodeJS for backend processing.

## Technologies

- **Frontend**: ReactJS, HTML, CSS, JavaScript
- **Backend**: NodeJS, ExpressJS
- **Web Scraping**: JavaScript (Selenium)
- **Database**: PostgreSQL

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cyberscope.git
   cd cyberscope
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

4. Set up the database:
   - Create a PostgreSQL database.
   - Run the migration scripts to set up the schema.

5. Start the backend and frontend servers:
   ```bash
   cd backend
   npm start
   cd ../frontend
   npm start
   ```




