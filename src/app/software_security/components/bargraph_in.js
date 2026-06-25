import React from 'react';
import { BargraphSecurity } from '../securityConfig';

export default async function BargraphSecurityInstalled() {
  return (
    <BargraphSecurity 
      statusType="Installed" 
      title="Top 10 Software Installed - By Affected Devices" 
    />
  );
}