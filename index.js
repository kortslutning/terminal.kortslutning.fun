const podcast = 4239;
function request(endpoint) {
  return fetch(`http://localhost:5000/v1/${endpoint}.json`).then(i => i.json());
}

function getPodcast() {
  return request(`podcasts/${podcast}`);
}
function getEpisodes() {
  return request(`podcasts/${podcast}/episodes`);
}

function getEmbed(id) {
  return request(`podcasts/${podcast}/episodes/${id}/embed`);
}

function getEpisode(id) {
  return Promise.all([
    request(`podcasts/${podcast}/episodes/${id}`),
    getEmbed(id)
  ]);
}

function Episode({ episode, onSelect }) {
  return h('li.episode', [
    h(
      'a.episode-item',
      { href: '#', title: episode.title, onClick: () => onSelect(episode.id) },
      episode.title
    )
  ]);
}

var md = new markdownit();

function EpisodeList({ episodes, onSelect }) {
  return h('aside.episodes', [
    h('ul', episodes.map(episode => h(Episode, { episode, onSelect })))
  ]);
}

function EpisodeDetails({ details, embed }) {
  console.log(embed);
  return h('.details', [
    h('div.embed', {
      style: { height: embed.height },
      dangerouslySetInnerHTML: { __html: embed.html.dark }
    }),
    h('article', [
      h('h2', details.title),
      h('div', {
        dangerouslySetInnerHTML: { __html: md.render(details.long_description) }
      })
    ])
  ]);
}

function PodcastDetails({ podcast }) {
  return h('header.podcastDetails', [
    h('img', { src: podcast.images.thumb, alt: podcast.title }),
    h('h1', [podcast.title, h('small', podcast.author)]),
    h('p', podcast.description)
  ]);
}

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      details: undefined,
      embed: undefined
    };

    this.selectEpisode = this.selectEpisode.bind(this);
  }

  componentDidMount() {
    if (typeof this.state.details === 'undefined') {
      this.selectEpisode(this.props.episodes[0].id);
    }
  }

  selectEpisode(id) {
    getEpisode(id).then(([details, embed]) => {
      this.setState({ details, embed });
    });
  }

  render() {
    const { episodes, podcast } = this.props;
    const { details, embed } = this.state;

    if (typeof details === 'undefined') {
      return h('section.kortslutning.crt', [h(EpisodeList, { episodes })]);
    }

    return h('section.kortslutning.crt', [
      h(PodcastDetails, { podcast }),
      h('div.content', [
        h(EpisodeList, { episodes, onSelect: this.selectEpisode }),
        h(EpisodeDetails, { details, embed })
      ])
    ]);
  }
}

const mount = document.querySelector('#app');
Promise.all([getPodcast(), getEpisodes()]).then(function([podcast, episodes]) {
  ReactDOM.render(h(App, { episodes, podcast }), mount);
});
