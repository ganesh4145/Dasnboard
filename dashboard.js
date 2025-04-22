import React, { useState, useEffect } from "react";
import axios from "axios";

function Dashboard() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState({
    CORRELATION_ID: "",
    STATUS: "",
    DATE_RANGE: "",
    APPLICATION_NAME: "",
    SEARCHVALUE: "",
    ERROR_MESSAGE: "",
    PAYLOAD_SEARCH: "",
    FROM_DATE: "",
    TO_DATE: "",
  });
  const [applicationList, setApplicationList] = useState([]);
  const [errorList, setErrorList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/listapplicationlist")
      .then((response) => {
        setApplicationList(response.data.Answer);
      })
      .catch((error) => {
        console.error(error);
      });

    axios
      .get("http://127.0.0.1:8000/listerror")
      .then((response) => {
        setErrorList(response.data.Answer);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilter((prevFilter) => ({ ...prevFilter, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    const headers = {
      "Application-Name": filter.APPLICATION_NAME,
      "Correlation-Id": filter.CORRELATION_ID,
      Status: filter.STATUS,
      "From-Date": filter.FROM_DATE,
      "To-Date": filter.TO_DATE,
      "Search-Value": filter.SEARCHVALUE,
      Error: filter.ERROR_MESSAGE,
      "Payload-Search": filter.PAYLOAD_SEARCH,
    };

    axios
      .get("http://127.0.0.1:8000/dashboard", { headers })
      .then((response) => {
        setData(response.data.Answer);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  const columns = [
    "CORRELATION_ID",
    "APPLICATION_NAME",
    "SEARCHKEY",
    "SEARCHVALUE",
    "STATUS_CODE",
    "STATUS",
    "FLOW_NAME",
    "REQUEST_PAYLOAD",
    "RESPONSE_PAYLOAD",
    "ERROR_MESSAGE",
    "SOURCE_SYSTEM",
    "TARGET_SYSTEM",
    "CREATE_DATE",
    "LAST_UPDATE_DATE",
    "EXECUTIONTIME",
    "PLATFORM",
    "RESUBMIT_COUNT",
    "RESUBMIT_MSG",
    "RESUBMIT_URL",
    "ATTRIBUTES",
    "RESUBMIT_DATE",
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl mb-4">Dashboard</h1>
      <form onSubmit={handleSearch}>
        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label
              className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              htmlFor="CORRELATION_ID"
            >
              Correlation ID
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="CORRELATION_ID"
              type="text"
              name="CORRELATION_ID"
              value={filter.CORRELATION_ID}
              onChange={handleFilterChange}
            />
          </div>
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label
              className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              htmlFor="STATUS"
            >
              Status
            </label>
            <select
              className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="STATUS"
              name="STATUS"
              value={filter.STATUS}
              onChange={handleFilterChange}
            >
              <option value="">Select Status</option>
              <option value="Fail">Fail</option>
              <option value="Success">Success</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label
              className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              htmlFor="DATE_RANGE"
            >
              Date Range
            </label>
            <select
              className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="DATE_RANGE"
              name="DATE_RANGE"
              value={filter.DATE_RANGE}
              onChange={(event) => {
                const value = event.target.value;
                if (value === "last_one_hour") {
                  setFilter((prevFilter) => ({
                    ...prevFilter,
                    FROM_DATE: new Date(
                      Date.now() - 60 * 60 * 1000
                    ).toISOString(),
                    TO_DATE: new Date().toISOString(),
                  }));
                } else if (value === "last_one_day") {
                  setFilter((prevFilter) => ({
                    ...prevFilter,
                    FROM_DATE: new Date(
                      Date.now() - 24 * 60 * 60 * 1000
                    ).toISOString(),
                    TO_DATE: new Date().toISOString(),
                  }));
                } else if (value === "last_three_hours") {
                  setFilter((prevFilter) => ({
                    ...prevFilter,
                    FROM_DATE: new Date(
                      Date.now() - 3 * 60 * 60 * 1000
                    ).toISOString(),
                    TO_DATE: new Date().toISOString(),
                  }));
                } else {
                  setFilter((prevFilter) => ({
                    ...prevFilter,
                    FROM_DATE: "",
                    TO_DATE: "",
                  }));
                }
                handleFilterChange(event);
              }}
            >
              <option value="">Select Date Range</option>
              <option value="last_one_hour">Last One Hour</option>
              <option value="last_one_day">Last One Day</option>
              <option value="last_three_hours">Last Three Hours</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          {filter.DATE_RANGE === "custom" && (
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="FROM_DATE"
              >
                From Date
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="FROM_DATE"
                type="datetime-local"
                name="FROM_DATE"
                value={filter.FROM_DATE}
                onChange={handleFilterChange}
              />
            </div>
          )}
          {filter.DATE_RANGE === "custom" && (
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="TO_DATE"
              >
                To Date
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="TO_DATE"
                type="datetime-local"
                name="TO_DATE"
                value={filter.TO_DATE}
                onChange={handleFilterChange}
              />
            </div>
          )}
        </div>
        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label
              className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              htmlFor="APPLICATION_NAME"
            >
              Application Name
            </label>
            <select
              className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="APPLICATION_NAME"
              name="APPLICATION_NAME"
              value={filter.APPLICATION_NAME}
              onChange={handleFilterChange}
            >
              <option value="">Select Application Name</option>
              {applicationList.map((application) => (
                <option
                  key={application.APPLICATION_NAME}
                  value={application.APPLICATION_NAME}
                >
                  {application.APPLICATION_NAME}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label
              className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              htmlFor="SEARCHVALUE"
            >
              Search Value
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="SEARCHVALUE"
              type="text"
              name="SEARCHVALUE"
              value={filter.SEARCHVALUE}
              onChange={handleFilterChange}
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label
              className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              htmlFor="ERROR_MESSAGE"
            >
              Error Message
            </label>
            <select
              className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="ERROR_MESSAGE"
              name="ERROR_MESSAGE"
              value={filter.ERROR_MESSAGE}
              onChange={handleFilterChange}
            >
              <option value="">Select Error Message</option>
              {errorList.map((error) => (
                <option key={error.ERROR_MESSAGE} value={error.ERROR_MESSAGE}>
                  {error.ERROR_MESSAGE}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label
              className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              htmlFor="PAYLOAD_SEARCH"
            >
              Payload Search
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="PAYLOAD_SEARCH"
              type="text"
              name="PAYLOAD_SEARCH"
              value={filter.PAYLOAD_SEARCH}
              onChange={handleFilterChange}
            />
          </div>
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={!Object.values(filter).some((value) => value !== "")}
        >
          Search
        </button>
      </form>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {data.length > 0 ? (
                data.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    {columns.map((column) => (
                      <td
                        key={`${rowIndex}-${column}`}
                        className="px-4 py-2 border-t"
                      >
                        {row[column]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-2 text-center border-t"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
