import React from 'react';
import { BargraphSecurity } from '../securityConfig';

export default async function BargraphSecurityPending() {
  return (
    <BargraphSecurity 
      statusType="Pending" 
      title="Top 10 Software Pending - By Affected Devices" 
    />
  );
}