const podcast = 4239;
function request(endpoint) {
  return fetch(
    `https://kortslutning-server-qtoearljfv.now.sh/v1/${endpoint}.json`
  ).then(i => i.json());
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
  console.log(episode);
  return h('li.episode', [
    h(
      'a.episode-item',
      {
        href: episode.sharing_url,
        title: episode.title,
        onClick: e => {
          e.preventDefault();
          onSelect(episode.id);
        }
      },
      `ep${episode.number}. ${episode.title}`
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
  return h('.details', [
    h('div.embed', {
      style: { height: embed.height },
      dangerouslySetInnerHTML: { __html: embed.html.dark }
    }),
    h('article', [
      h('h2', details.title),
      h('div', {
        dangerouslySetInnerHTML: { __html: md.render(details.long_description) }
      }),
      h(Cursor)
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

function Cursor() {
  return h('span.cursor', '█');
}

function PodcastFooter({ podcast }) {
  console.log(podcast);
  return h('footer.podcastFooter', [
    podcast.author,
    ' – ',
    h(
      'a',
      { href: `https://twitter.com/${podcast.twitter}` },
      '@' + podcast.twitter
    )
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

  selectEpisode(id) {
    getEpisode(id).then(([details, embed]) => {
      this.setState({ details, embed });
    });
  }

  render() {
    const { episodes, podcast } = this.props;
    const {
      details = this.props.details,
      embed = this.props.embed
    } = this.state;

    if (typeof episodes === 'undefined') {
      return h('section.kortslutning.crt', [h('div.loading', [h(Cursor)])]);
    }

    if (typeof details === 'undefined') {
      return h('section.kortslutning.crt', [h(EpisodeList, { episodes })]);
    }

    return h('section.kortslutning.crt', [
      h(PodcastDetails, { podcast }),
      h('div.content', [
        h(EpisodeList, { episodes, onSelect: this.selectEpisode }),
        h(EpisodeDetails, { details, embed })
      ]),
      h(PodcastFooter, { podcast })
    ]);
  }
}

const mount = document.querySelector('#app');
ReactDOM.render(h(App), mount);
Promise.all([getPodcast(), getEpisodes()]).then(function([podcast, episodes]) {
  return getEpisode(episodes[0].id).then(function([details, embed]) {
    ReactDOM.render(h(App, { episodes, podcast, details, embed }), mount);
  });
});
