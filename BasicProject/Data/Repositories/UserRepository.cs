using BasicProject.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace BasicProject.Data.Repositories
{
    public class UserRepository : Repository<User>, IUserRepository
    {
        public UserRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<User?> GetByNameAsync(string name)
        {
            return await _dbSet.FirstOrDefaultAsync(u => u.Name == name);
        }
    }
}
