import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

// GraphQL Query zum Abrufen der Deployments einer bestimmten App
const GET_APPLICATION_DEPLOYMENT_RECORDS = gql`
  query GetApplicationDeploymentRecords($appId: String!) {
    appDeploymentRecords: queryRecords(
      attributes: [
        { key: "type", value: { string: "ApplicationDeploymentRecord" } },
        { key: "application", value: { string: $appId } }
      ]
    ) {
      id
      names
      attributes {
        key
        value {
          ...ValueParts
        }
      }
    }
  }

  fragment ValueParts on Value {
    ... on BooleanValue {
      bool: value
    }
    ... on IntValue {
      int: value
    }
    ... on FloatValue {
      float: value
    }
    ... on StringValue {
      string: value
    }
    ... on BytesValue {
      bytes: value
    }
    ... on LinkValue {
      link: value
    }
  }
`;

// Funktion zum Health Check der URL
const checkHealth = async (url) => {
  try {
    const corsurl = 'https://corsproxy.io/?' + encodeURIComponent(url); 
    const response = await axios.get(corsurl, { validateStatus: (status) => status < 400 });
    return response.status < 400 ? 'Healthy' : 'Unhealthy';
  } catch (error) {
    console.error(`Health check failed for ${url}: ${error.message}`);
    return 'Unhealthy';
  }
};

const AppDetail = ({ app, onBack }) => {
  const { loading, error, data } = useQuery(GET_APPLICATION_DEPLOYMENT_RECORDS, {
    variables: { appId: app.id },
    fetchPolicy: 'no-cache',
  });

  const [healthStatuses, setHealthStatuses] = useState({});

  useEffect(() => {
    if (data) {
      const checkAllHealth = async () => {
        const statuses = {};
        const checks = data.appDeploymentRecords.map(async (deployment) => {
          const url = deployment.attributes.find(attr => attr.key === "url")?.value.string;
          if (url) {
            statuses[url] = await checkHealth(url);
          } else {
            statuses[url] = 'No URL available';
          }
        });
        await Promise.all(checks);
        setHealthStatuses(statuses);
      };

      checkAllHealth();
    }
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const name = app.attributes.find(attr => attr.key === "name")?.value.string || 'N/A';
  const appType = app.attributes.find(attr => attr.key === "app_type")?.value.string || 'N/A';
  const created = new Date(app.createTime).toLocaleDateString() || 'N/A';
  const expire = new Date(app.expiryTime).toLocaleDateString() || 'N/A';
  const version = app.attributes.find(attr => attr.key === "version")?.value.string || 'N/A';
  const appVersion = app.attributes.find(attr => attr.key === "app_version")?.value.string || 'N/A';
  const bondId = app.bondId || 'N/A';
  const repository = app.attributes.find(attr => attr.key === "repository")?.value.string || 'N/A';
  const repositoryRef = app.attributes.find(attr => attr.key === "repository_ref")?.value.string || 'N/A';

  return (
    <div className="app-detail">
      <button className="back-button" onClick={onBack}>Back</button>
      <div className="app-info">
        <h2>{name}</h2>
        <p>Type: {appType}</p>
        <p>Created: {created}</p>
        <p>Expire: {expire}</p>
        <p>Version: {version}</p>
        <p>App version: {appVersion}</p>
        <p>BondID: {bondId}</p>
        <p>Repository: {repository}</p>
        <p>RepositoryRef: {repositoryRef}</p>
      </div>
      <h3>Deployments:</h3>
      <ul className="deployments-list">
        {data.appDeploymentRecords.length > 0 ? (
          data.appDeploymentRecords.map(deployment => {
            const url = deployment.attributes.find(attr => attr.key === "url")?.value.string;
            const healthStatus = url ? healthStatuses[url] : 'Unknown';

            return (
              <li key={deployment.id} className="deployment-item">
                <p><strong>URL:</strong> <a href={url} target="_blank" rel="noopener noreferrer">{url}</a></p>
                <p>
                  <strong>Status:</strong> 
                  <span className={`health-status ${healthStatus ? healthStatus.toLowerCase() : 'unknown'}`}>
                    {healthStatus === 'Healthy' && <FontAwesomeIcon icon={faCheckCircle} />} 
                    {healthStatus === 'Unhealthy' && <FontAwesomeIcon icon={faTimesCircle} />} 
                    {healthStatus === 'Unknown' && <FontAwesomeIcon icon={faQuestionCircle} />}
                    {healthStatus}
                  </span>
                </p>
              </li>
            );
          })
        ) : (
          <p>No deployments found for this app.</p>
        )}
      </ul>
    </div>
  );
};

export default AppDetail;
