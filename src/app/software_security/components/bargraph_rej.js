import React from 'react';
import { BargraphSecurity } from '../securityConfig';

export default async function BargraphSecurityRejected() {
  return (
    <BargraphSecurity 
      statusType="Rejected" 
      title="Top 10 Software Rejected - By Affected Devices" 
    />
  );
}