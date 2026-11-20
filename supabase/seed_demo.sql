-- OPTIONAL demo content so the marketplace is not empty while you present the project.
-- Every row is flagged is_demo = true and the UI labels it "Demo listing" / "Demo data".
-- Centres are NOT marked verified. Delete these rows before going live:
--   delete from public.animals where is_demo; delete from public.centres where is_demo;
insert into public.centres (name, address, city, lat, lng, verified, is_demo)
select v.* from (values
 ('Demo Centre (sample record)', 'Sample address – replace with a real organisation', 'Delhi', 28.6139, 77.2090, false, true),
 ('Demo Centre B (sample record)', 'Sample address – replace with a real organisation', 'Mumbai', 19.0760, 72.8777, false, true)
) as v(name,address,city,lat,lng,verified,is_demo)
where not exists (select 1 from public.centres c where c.is_demo and c.name = v.name);

insert into public.animals (name, species, breed, age_months, gender, health_status, vaccinated, neutered, description, photo_url, city, centre_id, status, is_demo)
select v.name, v.species, v.breed, v.age, v.gender, v.health, v.vacc, v.neut, v.descr, v.photo, v.city,
       (select id from public.centres where is_demo and city = v.city limit 1), 'available', true
from (values
 ('Buddy','dog','Indian pariah mix',18,'male','Healthy',true,true,'Sample profile for demonstration. Friendly and energetic.','/img/photos/pet-1.jpg','Delhi'),
 ('Luna','cat','Domestic shorthair',10,'female','Healthy',true,false,'Sample profile for demonstration. Calm and curious.','/img/photos/pet-2.jpg','Delhi'),
 ('Coco','dog','Mixed breed',30,'female','Healthy',true,true,'Sample profile for demonstration. Gentle with children.','/img/photos/pet-3.jpg','Mumbai'),
 ('Sheru','dog','Indian pariah mix',48,'male','Recovered from a leg injury',true,true,'Sample profile for demonstration. Loyal and quiet.','/img/photos/pet-4.jpg','Mumbai')
) as v(name,species,breed,age,gender,health,vacc,neut,descr,photo,city)
where not exists (select 1 from public.animals where is_demo and name = v.name);
