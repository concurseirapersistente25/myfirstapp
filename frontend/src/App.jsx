import { useEffect, useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function App() {
  const [data, setData] = useState({
    participants: [],
    matches: [],
    confirmedTeamsByConfederation: {},
    pendingPlayoffSlots: [],
    confirmedCount: 0,
    pendingCount: 0
  });
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [adminKey, setAdminKey] = useState('admin-2026');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ date: '', stadium: '', homeScore: '', awayScore: '', status: 'agendado' });

  const fetchData = async () => {
    const response = await fetch(`${API_BASE}/world-cup`);
    const json = await response.json();
    setData(json);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const rounds = useMemo(() => {
    const grouped = data.matches.reduce((acc, match) => {
      if (!acc[match.round]) acc[match.round] = [];
      acc[match.round].push(match);
      return acc;
    }, {});

    return Object.entries(grouped).sort((a, b) => Number(a[0].replace(/\D/g, '')) - Number(b[0].replace(/\D/g, '')));
  }, [data.matches]);

  const selectedMatch = useMemo(
    () => data.matches.find((match) => match.id === selectedMatchId),
    [selectedMatchId, data.matches]
  );

  useEffect(() => {
    if (!selectedMatch) return;
    setForm({
      date: selectedMatch.date,
      stadium: selectedMatch.stadium,
      homeScore: selectedMatch.homeScore ?? '',
      awayScore: selectedMatch.awayScore ?? '',
      status: selectedMatch.status
    });
  }, [selectedMatch]);

  const submitUpdate = async (event) => {
    event.preventDefault();
    if (!selectedMatchId) {
      setMessage('Selecione um jogo para atualizar.');
      return;
    }

    const payload = {
      date: form.date,
      stadium: form.stadium,
      status: form.status,
      homeScore: form.homeScore === '' ? null : Number(form.homeScore),
      awayScore: form.awayScore === '' ? null : Number(form.awayScore)
    };

    const response = await fetch(`${API_BASE}/world-cup/matches/${selectedMatchId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey
      },
      body: JSON.stringify(payload)
    });

    const json = await response.json();
    setMessage(json.message || 'Atualização enviada.');

    if (response.ok) {
      await fetchData();
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Copa do Mundo 2026 - Tabela Completa</h1>
        <p>{data.format}</p>
      </header>

      <section className="card">
        <h2>Status de classificação</h2>
        <p><b>{data.confirmedCount}</b> seleções confirmadas e <b>{data.pendingCount}</b> vagas pendentes.</p>
        <div className="participants-grid">
          {Object.entries(data.confirmedTeamsByConfederation || {}).map(([confederation, teams]) => (
            <span key={confederation} className="chip">{confederation}: {teams.length} confirmadas</span>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Seleções confirmadas por continente</h2>
        {Object.entries(data.confirmedTeamsByConfederation || {}).map(([confederation, teams]) => (
          <div key={confederation}>
            <h3>{confederation}</h3>
            <div className="participants-grid">
              {teams.map((team) => (
                <span key={`${confederation}-${team}`} className="chip">{team}</span>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>Vagas pendentes (playoffs de março)</h2>
        <div className="participants-grid">
          {(data.pendingPlayoffSlots || []).map((slot) => (
            <span key={slot} className="chip">{slot}</span>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Jogos por rodada (fase de grupos)</h2>
        {rounds.map(([round, matches]) => (
          <div key={round}>
            <h3>{round}</h3>
            <div className="match-list">
              {matches.map((match) => (
                <article key={match.id} className="match-card">
                  <strong>{match.group} · {match.id}</strong>
                  <p>{match.homeTeam} {match.homeScore ?? '-'} x {match.awayScore ?? '-'} {match.awayTeam}</p>
                  <p>{new Date(match.date).toLocaleString('pt-BR')} · {match.stadium}</p>
                  <p>Status: <b>{match.status}</b></p>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>Backend admin - atualizar resultados e datas</h2>
        <form onSubmit={submitUpdate} className="admin-form">
          <label>
            Chave admin
            <input value={adminKey} onChange={(event) => setAdminKey(event.target.value)} />
          </label>

          <label>
            Jogo
            <select value={selectedMatchId} onChange={(event) => setSelectedMatchId(event.target.value)}>
              <option value="">Selecione</option>
              {data.matches.map((match) => (
                <option key={match.id} value={match.id}>{match.id} - {match.homeTeam} x {match.awayTeam}</option>
              ))}
            </select>
          </label>

          <label>
            Data/hora (ISO)
            <input value={form.date} onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))} />
          </label>

          <label>
            Estádio
            <input value={form.stadium} onChange={(event) => setForm((prev) => ({ ...prev, stadium: event.target.value }))} />
          </label>

          <div className="scores">
            <label>
              Gols casa
              <input type="number" value={form.homeScore} onChange={(event) => setForm((prev) => ({ ...prev, homeScore: event.target.value }))} />
            </label>
            <label>
              Gols fora
              <input type="number" value={form.awayScore} onChange={(event) => setForm((prev) => ({ ...prev, awayScore: event.target.value }))} />
            </label>
          </div>

          <label>
            Status
            <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}>
              <option value="agendado">Agendado</option>
              <option value="em andamento">Em andamento</option>
              <option value="encerrado">Encerrado</option>
            </select>
          </label>

          <button type="submit">Salvar atualização</button>
          {message ? <p className="message">{message}</p> : null}
        </form>
      </section>
    </div>
  );
}
