SET SQLFORMAT JSON
-- hide rowcount
SET FEEDBACK OFF

SPOOL doc.json

with only_relevant as (
select url
     , replace(title, 'JSDoc: Namespace: ', 'apex.') as title
     , case when rag_content_type_id = 2 then 'PL/SQL'
            when rag_content_type_id = 3 then 'JS'
            else 'Unknown'
       end as api_type
     , TO_NUMBER(REGEXP_SUBSTR(title, '^\d+')) as chapter
     , CASE WHEN INSTR(title, '.') > 0 then true else false end as has_parent
  from rag_content
 where rag_content_type_id in (2, 3)
   and title not in ('Title and Copyright Information', 'Index')
   and is_disabled = 'N'
)
select x.url
     , x.title
     , x.api_type
     , x.chapter
     , coalesce(y.title, '') as parent_title
  from only_relevant x
  left join only_relevant y 
    on y.has_parent = false
   and x.has_parent = true
   and y.chapter = x.chapter
;

SPOOL OFF
