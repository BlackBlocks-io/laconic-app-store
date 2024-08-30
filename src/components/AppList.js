import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';

const GET_APPLICATION_RECORDS = gql`
  query GetApplicationRecords {
    appDeploymentRecords: queryRecords(
      attributes: [
        { key: "type", value: { string: "ApplicationRecord" } }
      ]
    ) {
      id
      bondId
      createTime
      expiryTime
      names
      owners
      attributes {
        key
        value {
          ... on StringValue {
            string: value
          }
        }
      }
    }
  }
`;

const AppList = ({ onSelectApp }) => {
  const { loading, error, data } = useQuery(GET_APPLICATION_RECORDS);
  const [sortKey, setSortKey] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const appDeploymentRecords = Array.isArray(data?.appDeploymentRecords) ? data.appDeploymentRecords : [];

  // Sortierung
  const sortedApps = appDeploymentRecords.slice().sort((a, b) => {
    let aValue = '';
    let bValue = '';

    if (sortKey === 'name' || sortKey === 'app_type') {
      aValue = a.attributes.find(attr => attr.key === sortKey)?.value.string || '';
      bValue = b.attributes.find(attr => attr.key === sortKey)?.value.string || '';
    } else if (sortKey === 'createTime' || sortKey === 'expiryTime') {
      aValue = new Date(a[sortKey]).getTime();
      bValue = new Date(b[sortKey]).getTime();
    }

    return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
  });

  // Filterung
  const filteredApps = sortedApps.filter(app =>
    app.attributes.some(attr => {
      const attrValue = attr.value?.string?.toLowerCase() || '';
      return attrValue.includes(searchTerm.toLowerCase());
    })
  );

  // Sortier-Handler
  const handleSort = (key) => {
    setSortKey(prevKey => key);
    setSortOrder(prevOrder => (prevKey === key ? (prevOrder === 'asc' ? 'desc' : 'asc') : 'asc'));
  };

  return (
    <div className="app-list">
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="search-input"
      />

      <table className="app-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>Name</th>
            <th onClick={() => handleSort('app_type')}>Type</th>
            <th onClick={() => handleSort('createTime')}>Created</th>
            <th onClick={() => handleSort('expiryTime')}>Expire</th>
          </tr>
        </thead>
        <tbody>
          {filteredApps.length > 0 ? (
            filteredApps.map(app => {
              const name = app.attributes.find(attr => attr.key === "name")?.value.string || 'N/A';
              const appType = app.attributes.find(attr => attr.key === "app_type")?.value.string || 'N/A';
              const created = new Date(app.createTime).toLocaleDateString() || 'N/A';
              const expire = new Date(app.expiryTime).toLocaleDateString() || 'N/A';

              return (
                <tr 
                  key={app.id} 
                  onClick={() => onSelectApp(app)} 
                  className="app-row"
                  style={{ cursor: 'pointer' }}  // Zeigt den Zeiger beim Hover
                >
                  <td>{name}</td>
                  <td>{appType}</td>
                  <td>{created}</td>
                  <td>{expire}</td>
                </tr>
              );
            })
          ) : (
            <tr><td colSpan="4">No apps found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AppList;
