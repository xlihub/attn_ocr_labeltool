const images = require('./queries/images');
const projects = require('./queries/projects');

class ImporterStorage {
  _handleFile(req, file, cb) {
    const { projectId } = req.params;

    let str = '';
    file.stream.on('data', buffer => {
      str += buffer.toString();
    });

    file.stream.on('end', () => {
      const res = {};
      req.importRes.push(res);

      res.message = process(str, projectId);
      cb();
    });
  }

  _removeFile(req, file, cb) {
    cb();
  }
}

function process(str, projectId) {
  try {
    const obj = JSON.parse(str);
    const { imagePath, shapes, labels } = obj;

    const project = projects.get(projectId);
    const image = images.getForImport(projectId, imagePath);
    const { formParts } = project.form;
    const labelData = {};

    if (labels.length !== 0){
      labels.forEach(item => {
        const { label, type, prompt, options } = item;
        let labelId = null;
        if (formParts) {
          formParts.forEach(part => {
            if (part.name === label) {
              labelId = part.id;
            }
          });
        }

        if (!labelId) {
          // add a label to the project def
          labelId = genId();
          if (type === 'text') {
            formParts.push({
              id: labelId,
              type: type,
              name: label,
              prompt: prompt
            });
          } else if (type === 'select-one') {
            formParts.push({
              id: labelId,
              type: type,
              name: label,
              prompt: prompt,
              options: options,
            });
          }
        }
      });
    }

    shapes.forEach(shape => {
      const { label, points } = shape;
      let labelId = null;
      if (formParts) {
        formParts.forEach(part => {
          if (part.type === 'bbox' && part.name === label) {
            labelId = part.id;
          }
        });
      }

      if (!labelId) {
        // add a label to the project def
        labelId = genId();
        formParts.push({
          id: labelId,
          type: 'bbox',
          name: label,
        });
      }

      labelData[labelId] = labelData[labelId] || [];
      labelData[labelId].push({
        id: genId(),
        type: 'bbox',
        points: shape.points.map(([x, y]) => ({
          lng: x,
          lat: y,
        })),
      });
    });

    images.updateLabel(image.id, { labels: labelData });
    images.updateLabeled(image.id, true);
    projects.update(projectId, project);
  } catch (err) {
    return err.message;
  }
}

// It doesn't have to be the same as the one on the client, but the code is copy-pasted
function genId() {
  return (
    Math.random()
      .toString(36)
      .substring(2, 15) +
    Math.random()
      .toString(36)
      .substring(2, 15)
  );
}

module.exports = function() {
  return new ImporterStorage();
};
