import React, { Component } from 'react';
import LabelingApp from './LabelingApp';

import { Loader } from 'semantic-ui-react';
import DocumentMeta from 'react-document-meta';

import { demoMocks } from './demo';

import { exportLabelData } from './utils';

export default class LabelingLoader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      project: null,
      image: null,
      isLoaded: false,
      error: null,
    };
  }

  async fetch(...args) {
    const { projectId } = this.props.match.params;
    if (projectId === 'demo') {
      const path = typeof args[0] === 'string' ? args[0] : args[0].pathname;
      return demoMocks[path](...args);
    }

    return await fetch(...args);
  }

  componentDidMount() {
    this.refetch();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.imageId !== this.props.match.params.imageId) {
      this.refetch();
    }
  }

  async refetch() {
    this.setState({
      isLoaded: false,
      error: null,
      project: null,
      image: null,
    });

    const { match, history } = this.props;
    let { projectId, imageId } = match.params;

    try {
      const a = document.createElement('a');
      a.setAttribute('href', '/api/getLabelingInfo');
      const url = new URL(a.href);

      url.searchParams.append('projectId', projectId);
      if (imageId) {
        url.searchParams.append('imageId', imageId);
      }

      const { project, image } = await (await this.fetch(url)).json();

      if (!project) {
        history.replace(`/label/${projectId}/over`);
        return;
      }

      history.replace(`/label/${project.id}/${image.id}`);

      this.setState({
        isLoaded: true,
        project,
        image,
      });
    } catch (error) {
      this.setState({
        isLoaded: true,
        error,
      });
    }
  }

  async pushUpdate(labelData) {
    console.log(labelData);
    const { imageId } = this.props.match.params;
    const { success } = await (await this.fetch('/api/images/' + imageId, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ labelData }),
    })).json();
    console.log(success);
  }

  async markComplete() {
    const { imageId } = this.props.match.params;
    await this.fetch('/api/images/' + imageId, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ labeled: true }),
    });
    const img = await (await this.fetch('/api/images/' + imageId, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })).json();
    console.log(img);
    if (img) {
      const img_id = img.id;
      let labelData = img.labelData;
      console.log(labelData);
      var bill_type,
        cus_no,
        cus_name = '';
      console.log(this);
      const { project } = this.state;
      project.form.formParts.forEach(({ id, type, name, prompt }) => {
        const things = labelData.labels[id];
        console.log(things);
        if (type === 'text' || type === 'select-one') {
          if (name === 'Bill_Type') {
            bill_type = things[0];
          }
          if (name === 'Com_No') {
            cus_no = things[0];
          }
          if (name === 'Com_Name') {
            cus_name = things[0];
          }
        }
      });
      try {
        const { success, template } = await (await this.fetch(
          '/api/templateInfo' +
            '?type=' +
            bill_type +
            '&no=' +
            cus_no +
            '&name=' +
            cus_name,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          }
        )).json();
        console.log(template);
        console.log(success);
        if (!success) {
          let exportLabel = exportLabelData(labelData, project.form.formParts);
          try {
            const { success, template } = await (await this.fetch(
              '/api/templates',
              {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  bill_type,
                  cus_no,
                  cus_name,
                  exportLabel,
                  img_id,
                }),
              }
            )).json();
            if (success) {
              alert(
                '單據類型:' +
                  template.Bill_Type +
                  '\n' +
                  '公司統編:' +
                  template.Com_No +
                  '\n' +
                  '公司名稱:' +
                  template.Com_Name +
                  '\n' +
                  '添加成功!'
              );
            }
          } catch (error) {
            console.log(error);
          }
        }
      } catch (error) {
        console.log(error);
        this.setState({
          isLoaded: true,
          error,
        });
      }
    }
  }

  render() {
    const { history } = this.props;
    const { project, image, isLoaded, error } = this.state;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <Loader active inline="centered" />;
    }

    const title = `Image ${image.id} for project ${project.name} -- Label Tool`;

    const props = {
      onBack: () => {
        history.goBack();
      },
      onSkip: () => {
        history.push(`/label/${project.id}/`);
      },
      onSubmit: () => {
        this.markComplete();
        history.push(`/label/${project.id}/`);
      },
      onLabelChange: this.pushUpdate.bind(this),
    };

    const { referenceLink, referenceText } = project;

    return (
      <DocumentMeta title={title}>
        <LabelingApp
          labels={project.form.formParts}
          reference={{ referenceLink, referenceText }}
          labelData={image.labelData.labels || {}}
          imageUrl={image.link}
          fetch={this.fetch.bind(this)}
          demo={project.id === 'demo'}
          {...props}
        />
      </DocumentMeta>
    );
  }
}
