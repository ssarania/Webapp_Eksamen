using BasicProject.Data.Entities;

namespace BasicProject.Data.Repositories
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetByNameAsync(string name);
    }
}
