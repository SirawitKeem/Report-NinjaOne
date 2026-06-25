import React from 'react';
import { BargraphSecurity } from '../securityConfig';

export default async function BargraphSecurityApproved() {
  return (
    <BargraphSecurity 
      statusType="Approved" 
      title="Top 10 Software Approved - By Affected Devices" 
    />
  );
}
