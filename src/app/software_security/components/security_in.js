import React from 'react';
import { SecuritySummary } from '../securityConfig';

export default async function SecuritySummaryInstalled() {
  return <SecuritySummary statusType="Installed" />;
}