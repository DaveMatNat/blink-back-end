const puppeteer = require("puppeteer");
const fs = require("fs");

const LOGIN_URL = "https://xeregp.richmond.edu/StudentRegistrationSsb/ssb/classSearch/classSearch";
const BASE_URL = "https://xeregp.richmond.edu/StudentRegistrationSsb/ssb/searchResults/searchResults";
const DESCRIPTION_URL = "https://xeregp.richmond.edu/StudentRegistrationSsb/ssb/searchResults/getCourseDescription";
const TERM = "202420"; // Spring 2025
const PAGE_SIZE = 500;

const fetchCoursesWithSession = async () => {
  const browser = await puppeteer.launch({ headless: false }); // Set to true for headless scraping
  const page = await browser.newPage();

  console.log("🔄 Opening login page...");
  await page.goto(LOGIN_URL, { waitUntil: "networkidle2" });

  console.log("⚡ Please log in manually in the browser.");
  await new Promise((resolve) => setTimeout(resolve, 15000)); // Adjust time if needed

  console.log("✅ Logged in! Extracting session cookies...");
  const cookies = await page.cookies();

  let allCourses = [];
  let offset = 0;

  while (true) {
    const url = `${BASE_URL}?txt_term=${TERM}&pageOffset=${offset}&pageMaxSize=${PAGE_SIZE}&sortColumn=subjectDescription&sortDirection=asc`;

    console.log(`🔍 Fetching courses from offset ${offset}...`);

    const response = await page.evaluate(async (url, cookies) => {
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          "Cookie": cookies.map((c) => `${c.name}=${c.value}`).join("; "),
        },
      });
      return res.json();
    }, url, cookies);

    if (!response.success || !response.data || response.data.length === 0) break;

    for (let course of response.data) {
      course.courseMajor = course.subjectDescription; // Rename field

      // **Scrape course description as plain text**
      const descPage = `${DESCRIPTION_URL}?term=${TERM}&courseReferenceNumber=${course.courseReferenceNumber}`;

      try {
        await page.goto(descPage, { waitUntil: "domcontentloaded" });

        const courseDesc = await page.evaluate(() => {
          return document.body.innerText.trim(); // Extract plain text
        });

        course.courseDescription = courseDesc || "No description available.";
      } catch (err) {
        console.error(`❌ Error scraping description for CRN ${course.courseReferenceNumber}:`, err);
        course.courseDescription = "Error fetching description.";
      }
    }

    allCourses = allCourses.concat(response.data);
    offset += PAGE_SIZE;

    console.log(`✅ Fetched ${response.data.length} courses...`);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Avoid rate limiting
  }

  console.log(`🎯 Total courses fetched: ${allCourses.length}`);

  // Save data locally
  fs.writeFileSync("courses.json", JSON.stringify(allCourses, null, 2));

  await browser.close();
};

fetchCoursesWithSession();