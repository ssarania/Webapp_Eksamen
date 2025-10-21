using BasicProject.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace BasicProject.Data.Repositories
{
    public class QuizRepository : Repository<Quiz>, IQuizRepository
    {
        public QuizRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Quiz>> GetByAuthorAsync(int authorId)
        {
            return await _dbSet.Where(q => q.AuthorId == authorId).ToListAsync();
        }
    }
}
