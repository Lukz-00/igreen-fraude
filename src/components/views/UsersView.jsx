import { USERS, ROLE_PERMS } from '../../data/constants'
import { Avatar } from '../Atoms'

export function UsersView({ currentUser }) {
  return (
    <div className="main">
      <div className="page-header">
        <div className="page-title">Usuários & Permissões</div>
        <div className="page-sub">
          Cadastros ativos — alterações de perfil via chamado interno ao Admin
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Usuários cadastrados</div>
          {USERS.map(u => (
            <div key={u.id} className="user-row">
              <Avatar name={u.name} size={32} bg={u.avBg} fg={u.avFg} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{u.sector}</div>
              </div>
              <span className={`tag ${u.role === 'Admin' ? 't-green' : u.role === 'Gestor' ? 't-blue' : 't-grey'}`}>
                {u.role}
              </span>
              {u.id === currentUser.id && <span className="tag t-amber" style={{ fontSize: 9 }}>você</span>}
            </div>
          ))}
        </div>

        <div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Perfis de acesso</div>
          {Object.entries(ROLE_PERMS).map(([role, perms]) => (
            <div key={role} className="card" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{role}</span>
                <span className="tag t-grey">{perms.length} permissões</span>
              </div>
              <div>
                {perms.map(p => <span key={p} className="perm-chip">✓ {p}</span>)}
              </div>
            </div>
          ))}

          <div className="callout" style={{ marginTop: 0 }}>
            <strong>Regras:</strong> Colaborador acessa apenas seus próprios tickets. Reatribuição disponível para Analista de Dados, Gestor e Admin. Logs de sistema acessíveis apenas ao Admin.
          </div>
        </div>
      </div>
    </div>
  )
}
