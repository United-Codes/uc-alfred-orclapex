SET SQLFORMAT JSON
-- hide rowcount
SET FEEDBACK OFF

SPOOL views.json

select apex_view_name as "name"
     , comments as "description"
     , parent_view as "parentView"
  from apex_dictionary
 where column_id = 0
 union all
select 'APEX_MAIL_LOG' as "name"
     , 'Log of APEX mails' as "description"
     , null as "parentView"
  from dual
 union all
select 'APEX_MAIL_QUEUE' as "name"
     , 'Mail queue' as "description"
     , null as "parentView"
  from dual;

SPOOL OFF
