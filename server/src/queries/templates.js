const db = require('./db').getDb();

module.exports = {
  getAll: () => {
    const templates = db
      .prepare(
        `
select templates.Bill_Type, templates.Com_No, templates.Com_Name, templates.TemplateData , templates.imagesId
  from templates
  left join images on templates.imagesId = images.id
 group by templates.id;
`
      )
      .all();

    return templates.map(template => ({
      ...template,
      TemplateData: JSON.parse(template.TemplateData),
    }));
  },
  get: (Bill_Type, Com_No, Com_Name) => {
    const template = db
      .prepare(
        `
select *
  from templates
 where Bill_Type = ? and Com_No = ?;
`
      )
      .get(Bill_Type, Com_No);
    if (!template) {
      const new_template = db
        .prepare(
          `
select *
  from templates
 where Bill_Type = ? and Com_Name = ?;
`
        )
        .get(Bill_Type, Com_Name);
      if (!new_template) {
        return { ...new_template };
      } else {
        return {
          ...new_template,
          TemplateData: JSON.parse(new_template.TemplateData),
        };
      }
    } else {
      return { ...template, TemplateData: JSON.parse(template.TemplateData) };
    }
  },
  getImageInfo: image => {
    const template = db
      .prepare(
        `
select *
  from images
inner join templates on images.id = templates.imagesId
where originalName = ?;
`
      )
      .get(image);
    return { ...template };
  },
  create: (Bill_Type, Com_No, Com_Name, TemplateData, img_id) => {
    const id = db
      .prepare(
        `
insert into templates(Bill_Type, Com_No, Com_Name, TemplateData , imagesId) values (?, ?, ?, ?, ?);
`
      )
      .run(Bill_Type, Com_No, Com_Name, TemplateData, img_id).lastInsertRowid;

    const template = db
      .prepare(
        `
select * from templates where id = ?;
`
      )
      .get(id);

    return {
      ...template,
      TemplateData: JSON.parse(template.TemplateData),
    };
  },
  update: (Bill_Type, Com_No, Com_Name, TemplateData) => {
    if (
      !project.name ||
      project.name === '' ||
      !Array.isArray(project.form.formParts)
    ) {
      throw new Error('Project must have a non-empty name and a form object.');
    }
    if (!id) {
      throw new Error('Must present a valid id.');
    }

    db.prepare(
      `
update projects
   set name = ?, form = ?, referenceLink = ?, referenceText = ?
 where id = ?;
`
    ).run(
      project.name,
      JSON.stringify(project.form),
      project.referenceLink,
      project.referenceText,
      id
    );
  },
  delete: id => {
    db.prepare(`delete from templates where id=?;`).run(id);
  },
};
