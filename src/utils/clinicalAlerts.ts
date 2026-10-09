import { HandoverRecord } from '../types';
import {
  isTempAbnormal,
  isPulseAbnormal,
  isRespAbnormal,
  isBpAbnormal,
  isSpo2Abnormal,
  isPainAbnormal,
  isGcsAbnormal,
} from './vitalSignRanges';

export interface AlertCheckResult {
  hasUnaddressedLab: boolean;
  hasUnaddressedVital: boolean;
  hasAbnormalUnaddressed: boolean;
  unaddressedLabsCount: number;
  unaddressedVitalsCount: number;
  totalUnaddressedCount: number;
  alertMessages: string[];
}

export function checkAbnormalAlertStatus(record: HandoverRecord): AlertCheckResult {
  let unaddressedLabsCount = 0;
  let unaddressedVitalsCount = 0;
  const alertMessages: string[] = [];

  // 1. Check Labs: If a Lab item/value is entered, but action (處置) is empty
  if (record.labs && record.labs.length > 0) {
    for (const lab of record.labs) {
      const hasItemOrVal = (lab.item && lab.item.trim() !== '') || (lab.value && lab.value.trim() !== '');
      const isActionEmpty = !lab.action || lab.action.trim() === '';

      if (hasItemOrVal && isActionEmpty) {
        unaddressedLabsCount++;
        alertMessages.push(`Lab 異常未處置：${lab.item || '未填寫項目'} (${lab.value || '無數值'})`);
      }
    }
  }

  // 2. Check Vital Signs: If any vital sign is in abnormal range, but action (處置) is empty
  if (record.vitalSigns && record.vitalSigns.length > 0) {
    for (const v of record.vitalSigns) {
      const isTemp = isTempAbnormal(v.T);
      const isPulse = isPulseAbnormal(v.P);
      const isResp = isRespAbnormal(v.R);
      const isBp = isBpAbnormal(v.BP);
      const isSpo2 = isSpo2Abnormal(v.SpO2);
      const isPain = isPainAbnormal(v.Pain);
      const isGcs = isGcsAbnormal(v.GCS);

      const isVitalAbnormal = isTemp || isPulse || isResp || isBp || isSpo2 || isPain || isGcs;
      const isActionEmpty = !v.action || v.action.trim() === '';

      if (isVitalAbnormal && isActionEmpty) {
        unaddressedVitalsCount++;
        const abnormalItems: string[] = [];
        if (isTemp) abnormalItems.push(`體溫 ${v.T}°C`);
        if (isBp) abnormalItems.push(`血壓 ${v.BP}`);
        if (isPulse) abnormalItems.push(`心跳 ${v.P}bpm`);
        if (isSpo2) abnormalItems.push(`血氧 ${v.SpO2}%`);
        if (isResp) abnormalItems.push(`呼吸 ${v.R}次`);
        if (isPain) abnormalItems.push(`疼痛 ${v.Pain}分`);
        if (isGcs) abnormalItems.push(`GCS ${v.GCS}`);

        alertMessages.push(`Vital Sign 異常未處置 (${v.time || '未指定時間'}): ${abnormalItems.join(', ')}`);
      }
    }
  }

  const hasUnaddressedLab = unaddressedLabsCount > 0;
  const hasUnaddressedVital = unaddressedVitalsCount > 0;
  const totalUnaddressedCount = unaddressedLabsCount + unaddressedVitalsCount;

  return {
    hasUnaddressedLab,
    hasUnaddressedVital,
    hasAbnormalUnaddressed: totalUnaddressedCount > 0,
    unaddressedLabsCount,
    unaddressedVitalsCount,
    totalUnaddressedCount,
    alertMessages,
  };
}
