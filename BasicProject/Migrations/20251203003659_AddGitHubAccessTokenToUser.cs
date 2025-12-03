using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BasicProject.Migrations
{
    /// <inheritdoc />
    public partial class AddGitHubAccessTokenToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GitHubAccessToken",
                table: "Users",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GitHubAccessToken",
                table: "Users");
        }
    }
}
