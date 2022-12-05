const db = require('./db').getDb();

module.exports = {
  getAll: () => {
    const templates = db
      .prepare(
        `
select templates.Bill_Type, templates.Com_No, templates.Com_Name, templates.labelData
  from templates
 group by templates.id;
`
      )
      .all();

    return templates.map(template => ({
      ...template,
      labelData: JSON.parse(template.labelData),
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
    console.log(template)
    if (!template){
        const new_template = db
      .prepare(
        `
select *
  from templates
 where Bill_Type = ? and Com_Name = ?;
`
      )
      .get(Bill_Type, Com_Name);
        console.log(new_template)
        if (!new_template){
            return { ...new_template,  };
        }else {
            return { ...new_template, labelData: JSON.parse(new_template.labelData) };
        }
    }else {
        return { ...template, labelData: JSON.parse(template.labelData) };
    }
  },
  create: (Bill_Type, Com_No, Com_Name, labelData) => {
      console.log(Bill_Type);
      console.log(Com_No);
      console.log(Com_Name);
    const id = db
      .prepare(
        `
insert into templates(Bill_Type, Com_No, Com_Name, labelData) values (?, ?, ?, ?);
`
      )
      .run(Bill_Type, Com_No, Com_Name, labelData).lastInsertRowid;

    const template = db
      .prepare(
        `
select * from templates where id = ?;
`
      )
      .get(id);

    return {
      ...template,
      labelData: JSON.parse(template.labelData),
    };
  },
  update: (Bill_Type, Com_No, Com_Name, labelData) => {
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
  updateReference: (id, referenceLink) => {
    db.prepare(
      `
update projects
   set referenceLink = ?
 where id = ?;
`
    ).run(referenceLink, id);
  },
  delete: id => {
    db.prepare(`delete from projects where id=?;`).run(id);
  },
};
