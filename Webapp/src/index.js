import 'regenerator-runtime/runtime';
import { BlobServiceClient } from '@azure/storage-blob';
import Papa from 'papaparse';

const uploadButton = document.getElementById('upload-button');
const downloadButton = document.getElementById('download-button');
const fileInput = document.getElementById('file-input');
if (!fileInput.files.length) {
    alert('Please select a file before clicking upload.');
} else {
    console.log('File selected:', fileInput.files[0]);
}
const csvDataContainer = document.getElementById('csv-data-container');
const span = document.getElementById('span');

const blobSasUrl = "https://storagedemopaco.blob.core.windows.net/?sv=2022-11-02&ss=b&srt=sco&sp=rwdlaciytfx&se=2024-06-19T15:25:45Z&st=2024-06-19T07:25:45Z&spr=https&sig=f%2B3FUukm%2FmK0zk3Yz0TIS9dWQIyKoUle8XFD8XBEUo8%3D";
const blobdownload = "https://storagedemopaco.blob.core.windows.net/invalid/invalid.csv?sv=2022-11-02&ss=b&srt=sco&sp=rwdlaciytfx&se=2024-06-19T15:25:45Z&st=2024-06-19T07:25:45Z&spr=https&sig=f%2B3FUukm%2FmK0zk3Yz0TIS9dWQIyKoUle8XFD8XBEUo8%3D";

const blobServiceClient = new BlobServiceClient(blobSasUrl);
const containerName = "uploadcsv";
const containerClient = blobServiceClient.getContainerClient(containerName);

const uploadFiles = async () => {
    try {
        const promises = [];
        for (const file of fileInput.files) {
            const blockBlobClient = containerClient.getBlockBlobClient(file.name);
            promises.push(blockBlobClient.uploadBrowserData(file));
        }
        await Promise.all(promises);
        alert('Upload complete.');
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
};

const checkFileAvailability = async () => {
    try {
        const response = await fetch(blobdownload, { method: 'HEAD' });

        if (!response.ok) {
            downloadButton.style.display = 'none';
            span.style.display = 'none';
        } else {
            downloadButton.style.display = 'block';
            span.style.display = 'block';
        }
    } catch (error) {
        downloadButton.style.display = 'none';
        console.error('Error checking file availability:', error);
    }
};

const downloadFile = async () => {
    try {
        window.location.href = blobdownload;
    } catch (error) {
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            alert('Failed to fetch. This may be due to CORS issues. Please check the CORS settings on the Azure Blob Storage.');
        } else {
            alert(`Error: ${error.message}`);
        }
    }
};

const fetchCSVData = async () => {
    csvDataContainer.innerHTML = ''; 
    const urls = [
        'https://storagedemopaco.blob.core.windows.net/log/log.csv?sv=2022-11-02&ss=b&srt=sco&sp=rwdlaciytfx&se=2024-06-19T15:25:45Z&st=2024-06-19T07:25:45Z&spr=https&sig=f%2B3FUukm%2FmK0zk3Yz0TIS9dWQIyKoUle8XFD8XBEUo8%3D'
    ];

    let dataFetched = false;

    for (const url of urls) {
        try {
            console.log(`Attempting to fetch: ${url}`);
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.text();
                console.log(`Successfully fetched data from: ${url}`);
                console.log('Raw CSV data:', data); // Log raw data
                parseAndDisplayCSV(data);
                dataFetched = true;
                break;  // If successful, exit the loop
            } else {
                console.error(`Failed to fetch ${url}: ${response.statusText}`);
            }
        } catch (error) {
            console.error(`Error fetching CSV data from ${url}:`, error);
        }
    }

    if (!dataFetched) {
        csvDataContainer.innerHTML = `<p>Loading---</p>`;
    }
};

const parseAndDisplayCSV = (data) => {
    Papa.parse(data, {
        header: true,
        skipEmptyLines: true,
        delimiter: ",",
        complete: (results) => {
            if (results.errors.length) {
                console.error('Errors occurred during parsing:', results.errors);
                csvDataContainer.innerHTML = `<p>Error parsing CSV data: ${results.errors.map(err => err.message).join(', ')}</p>`;
                return;
            }

            const headers = results.meta.fields;
            const rows = results.data.map(row => headers.map(header => row[header]));

            const table = document.createElement('table');
            [headers, ...rows].forEach((row, index) => {
                const tr = document.createElement('tr');
                row.forEach(cell => {
                    const cellElement = document.createElement(index === 0 ? 'th' : 'td');
                    cellElement.textContent = cell;
                    tr.appendChild(cellElement);
                });
                table.appendChild(tr);
            });

            csvDataContainer.innerHTML = '';
            csvDataContainer.appendChild(table);
        }
    });
};

uploadButton.addEventListener('click', uploadFiles);
downloadButton.addEventListener('click', downloadFile);
document.addEventListener('DOMContentLoaded', fetchCSVData);
checkFileAvailability();
