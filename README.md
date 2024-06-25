# ADF-CSV-Validation
A Web application that allows users to upload CSV files containing user details. Upon submission, the application uses Azure Data Factory (ADF) to process the data, identifies valid and invalid entries, and returns a new CSV file with the invalid data, while also inserting the valid data into a database. 
<br>

<br>



<h2>File Upload and Download</h2>
<ul>
  <li>The script allows users to upload files to Azure Blob Storage.</li>
  <li><code>uploadFiles</code> function uploads selected files to Blob Storage.</li>
  <li><code>checkFileAvailability</code> function checks if a specific file (invalid.csv) is available in Blob Storage and toggles the visibility of the download button accordingly.</li>
  <li><code>downloadFile</code> function triggers the download of the specified file from Blob Storage.</li>
</ul>

<h2>Azure Data Factory (ADF) Pipeline</h2>
<h3>Steps</h3>
<ol>
  <li><strong>File Metadata Retrieval</strong>
    <ul>
      <li>Retrieve metadata (structure and item name) for the latest file identified in the previous pipeline.</li>
    </ul>
  </li>
  <li><strong>Reference Metadata Retrieval</strong>
    <ul>
      <li>Retrieve metadata (structure) from the "Employee" dataset for comparison.</li>
    </ul>
  </li>
  <li><strong>Structure Comparison</strong>
    <ul>
      <li>Compare the structure of the latest file with the reference structure.</li>
    </ul>
  </li>
  <li><strong>Branching Based on Comparison</strong>
    <ul>
      <li>If structures do not match:
        <ul>
          <li>Log schema mismatch error.</li>
          <li>Log pipeline failure status in DB_log.</li>
        </ul>
      </li>
      <li>If structures match:
        <ul>
          <li>Validate the latest file's content for empty fields.</li>
        </ul>
    </ul>
  </li>
  <li><strong> Validation</strong>
    <ul>
      <li>Execute validation data flow to check for empty fields in the latest file.</li>
      <li>If validation fails:
        <ul>
          <li>Log validation error details.</li>
          <li>Log pipeline failure status in DB_log.</li>
        </ul>
      </li>
      <li>If validation succeeds:
        <ul>
          <li>Log validation success status.</li>
          <li>Log pipeline success status in DB_log.</li>
        </ul>
    </ul>
  </li>
  <li><strong>Error Handling</strong>
    <ul>
      <li>If the File metadata retrieval fails:
        <ul>
          <li>Log error indicating the file cannot be read.</li>
          <li>Log pipeline failure status in DB_log.</li>
        </ul>
    </ul>
  </li>
  <li><strong>Final Logging</strong>
    <ul>
      <li>Ensure all activities, including error handling, are logged appropriately.</li>
      <li>Capture relevant pipeline execution details such as run ID, trigger time, and status (Success or Failure).</li></h3>

<h2>Fetching and Displaying CSV Data</h2>
<ul>
<li>The script fetches CSV data from Azure Blob Storage using the Blob Service Client.</li>


<li>The fetchData function attempts to download CSV files from Blob Storage in a specified order until one succeeds.</li>

<li>The streamToString function converts the downloaded stream to a string. The parseCSV function parses the CSV string into an array of arrays (headers and rows). </li>
<li>The displayCSVData function dynamically creates and populates an HTML table with the parsed CSV data.</li>
</ul>