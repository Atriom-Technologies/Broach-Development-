export function deriveNotificationCTA(
  notification,
  chatRoom?: { orgJoined: boolean; reporterJoined: boolean },
): { cta: string; clickable: boolean }[] {
  const { ownerType, status } = notification;

  if (status === 'CLOSED')
    return [{ cta: 'Remove from List', clickable: true }];

  if (ownerType === 'ORGANIZATION') {
    if (status === 'PENDING')
      return [
        { cta: 'Contact Reporter', clickable: true },
        { cta: 'Cancel', clickable: true },
      ];

    if (status === 'IN_DISCUSSION')
      return [
        { cta: 'Respond', clickable: true },
        { cta: 'End', clickable: true },
      ];
  }

  if (ownerType === 'REPORTER') {
    if (status === 'PENDING')
      return [
        { cta: 'Respond', clickable: false },
        { cta: 'Cancel', clickable: true },
      ];
    if (status === 'IN_DISCUSSION')
      return [
        { cta: 'Respond', clickable: !chatRoom?.reporterJoined },
        { cta: 'End', clickable: chatRoom?.reporterJoined ?? false },
      ];
  }

  return [];
}
