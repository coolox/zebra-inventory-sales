# TASK-151 — Закрыть Clothing Pilot и передать production в эксплуатацию

Статус: pending

## Цель

После реального pilot периода доказать, что Zebra Boutique может ежедневно работать в production без критических расхождений.

## Зависимости

TASK-088, TASK-150.

## Критерии готовности

- Pilot прошёл согласованный период; рекомендация — минимум 7 рабочих дней.
- Daily sales, payments, stock, cancellations/exchanges и reconciliation подписаны Owner.
- Нет открытых P0/P1; P2/P3 оформлены как post-launch backlog.
- Monitoring, backup freshness и incident response проверялись в ходе pilot.
- Owner/Seller runbooks обновлены по реальной обратной связи.
- Зафиксировано решение: continue production, rollback или extend pilot.
- При `continue production` система объявлена запущенной и передана в обычный support cycle.

## Тесты

- Итоговый physical/system reconciliation.
- Backup/monitoring/auth/device health evidence.
- Pilot incident и defect review.
- Owner acceptance sign-off.
