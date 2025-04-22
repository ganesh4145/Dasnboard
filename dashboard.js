// Dashboard.js
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

  // Table state
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [columnFilters, setColumnFilters] = useState({});
  const [appNameSearch, setAppNameSearch] = useState("");
  const [errorMessageSearch, setErrorMessageSearch] = useState("");

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/listapplicationlist")
      .then((response) => {
        // Ensure we're handling the response correctly - it might be an array of arrays
        let formattedList = response.data.Answer;
        if (
          Array.isArray(formattedList) &&
          formattedList.length > 0 &&
          Array.isArray(formattedList[0])
        ) {
          formattedList = formattedList.map((item) => ({
            APPLICATION_NAME: item[0],
          }));
        }
        setApplicationList(formattedList);
      })
      .catch((error) => {
        console.error(error);
      });

    axios
      .get("http://127.0.0.1:8000/listerror")
      .then((response) => {
        // Ensure we're handling the response correctly - it might be an array of arrays
        let formattedList = response.data.Answer;
        if (
          Array.isArray(formattedList) &&
          formattedList.length > 0 &&
          Array.isArray(formattedList[0])
        ) {
          formattedList = formattedList.map((item) => ({
            ERROR_MESSAGE: item[0],
          }));
        }
        setErrorList(formattedList);
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
        // Reset pagination when new data is loaded
        setCurrentPage(0);
        // Reset column filters
        setColumnFilters({});
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

  // Handle sort
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Apply sort to data
  const sortedData = React.useMemo(() => {
    let sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue == null) return sortConfig.direction === "asc" ? 1 : -1;
        if (bValue == null) return sortConfig.direction === "asc" ? -1 : 1;

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return sortConfig.direction === "asc"
          ? aValue > bValue
            ? 1
            : -1
          : aValue < bValue
            ? 1
            : -1;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  // Filter data based on column filters
  const filteredData = React.useMemo(() => {
    return sortedData.filter((row) => {
      return Object.entries(columnFilters).every(([column, filterValue]) => {
        if (!filterValue) return true;
        const cellValue = row[column];
        if (cellValue == null) return false;
        return String(cellValue)
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      });
    });
  }, [sortedData, columnFilters]);

  // Handle column filter change
  const handleColumnFilterChange = (column, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
    setCurrentPage(0); // Reset to first page when filters change
  };

  // Pagination logic
  const pageCount = Math.ceil(filteredData.length / rowsPerPage);
  const displayData = filteredData.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  // Filter application list based on search
  const filteredApplicationList = applicationList.filter((app) =>
    app.APPLICATION_NAME.toLowerCase().includes(appNameSearch.toLowerCase())
  );

  // Filter error list based on search
  const filteredErrorList = errorList.filter(
    (err) =>
      err.ERROR_MESSAGE &&
      err.ERROR_MESSAGE.toLowerCase().includes(errorMessageSearch.toLowerCase())
  );

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
            <div className="relative">
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-1 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                type="text"
                placeholder="Search application names..."
                value={appNameSearch}
                onChange={(e) => setAppNameSearch(e.target.value)}
              />
              {appNameSearch && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-60 overflow-y-auto">
                  {filteredApplicationList.length > 0 ? (
                    filteredApplicationList.map((app, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setFilter((prev) => ({
                            ...prev,
                            APPLICATION_NAME: app.APPLICATION_NAME,
                          }));
                          setAppNameSearch("");
                        }}
                      >
                        {app.APPLICATION_NAME}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500">
                      No applications found
                    </div>
                  )}
                </div>
              )}
              {filter.APPLICATION_NAME && (
                <div className="mt-2 flex items-center bg-blue-100 p-2 rounded">
                  <span className="flex-grow">{filter.APPLICATION_NAME}</span>
                  <button
                    type="button"
                    className="ml-2 text-blue-500 hover:text-blue-700"
                    onClick={() =>
                      setFilter((prev) => ({ ...prev, APPLICATION_NAME: "" }))
                    }
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
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
            <div className="relative">
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-1 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                type="text"
                placeholder="Search error messages..."
                value={errorMessageSearch}
                onChange={(e) => setErrorMessageSearch(e.target.value)}
              />
              {errorMessageSearch && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-60 overflow-y-auto">
                  {filteredErrorList.length > 0 ? (
                    filteredErrorList.map((err, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setFilter((prev) => ({
                            ...prev,
                            ERROR_MESSAGE: err.ERROR_MESSAGE,
                          }));
                          setErrorMessageSearch("");
                        }}
                      >
                        {err.ERROR_MESSAGE}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500">
                      No errors found
                    </div>
                  )}
                </div>
              )}
              {filter.ERROR_MESSAGE && (
                <div className="mt-2 flex items-center bg-blue-100 p-2 rounded">
                  <span className="flex-grow">{filter.ERROR_MESSAGE}</span>
                  <button
                    type="button"
                    className="ml-2 text-blue-500 hover:text-blue-700"
                    onClick={() =>
                      setFilter((prev) => ({ ...prev, ERROR_MESSAGE: "" }))
                    }
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
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
        <div className="flex justify-center mt-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2">Loading...</p>
          </div>
        </div>
      ) : (
        <>
          {data.length > 0 && (
            <div className="flex items-center justify-between mb-4 mt-8">
              <div className="flex items-center">
                <label className="mr-2 text-sm font-medium">
                  Rows per page:
                </label>
                <select
                  className="border rounded py-1 px-2"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(0);
                  }}
                >
                  {[10, 25, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-sm text-gray-600">
                Showing{" "}
                {Math.min(currentPage * rowsPerPage + 1, filteredData.length)}{" "}
                to{" "}
                {Math.min((currentPage + 1) * rowsPerPage, filteredData.length)}{" "}
                of {filteredData.length} entries
              </div>
            </div>
          )}

          <div className="overflow-x-auto mt-6 border rounded shadow">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column}
                      className="sticky top-0 bg-gray-100 px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      <div className="flex flex-col">
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={() => requestSort(column)}
                        >
                          {column}
                          {sortConfig.key === column ? (
                            <span className="ml-1">
                              {sortConfig.direction === "asc" ? "▲" : "▼"}
                            </span>
                          ) : (
                            <span className="ml-1 text-gray-300">▼</span>
                          )}
                        </div>
                        <input
                          type="text"
                          className="mt-1 px-2 py-1 w-full text-xs border rounded"
                          placeholder={`Filter ${column}`}
                          value={columnFilters[column] || ""}
                          onChange={(e) =>
                            handleColumnFilterChange(column, e.target.value)
                          }
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {displayData.length > 0 ? (
                  displayData.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      {columns.map((column) => (
                        <td
                          key={`${rowIndex}-${column}`}
                          className="px-4 py-2 border-t text-sm"
                        >
                          {row[column] !== undefined ? String(row[column]) : ""}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-6 text-center border-t text-gray-500"
                    >
                      {data.length > 0
                        ? "No matching records found"
                        : "No data available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data.length > 0 && pageCount > 1 && (
            <div className="flex justify-center mt-4">
              <nav className="flex items-center">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className={`px-3 py-1 rounded-l ${
                    currentPage === 0
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Previous
                </button>

                <div className="flex mx-1">
                  {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                    const pageIndex =
                      i + Math.max(0, Math.min(currentPage - 2, pageCount - 5));
                    return (
                      <button
                        key={pageIndex}
                        onClick={() => setCurrentPage(pageIndex)}
                        className={`w-8 mx-1 ${
                          currentPage === pageIndex
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                        } rounded`}
                      >
                        {pageIndex + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(pageCount - 1, currentPage + 1))
                  }
                  disabled={currentPage >= pageCount - 1}
                  className={`px-3 py-1 rounded-r ${
                    currentPage >= pageCount - 1
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
